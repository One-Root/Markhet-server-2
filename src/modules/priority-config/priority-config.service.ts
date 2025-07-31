import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { PriorityConfig } from '@one-root/markhet-core';

import { CreatePriorityConfigDto } from './dto/create-priority-config.dto';

import {
  UserKey,
  FarmKey,
  CropKey,
  ConfigRelation,
  DependencyType,
  DependencyOperator,
} from '../../common/enums/priority-config.enum';

import {
  ConfigRelationData,
  DependencyValueType,
} from '../../common/types/priority-config.type';

@Injectable()
export class PriorityConfigService {
  constructor(
    @InjectRepository(PriorityConfig)
    private readonly priorityConfigRepository: Repository<PriorityConfig>,
  ) {}

  find(entitities: ConfigRelation[]): Promise<PriorityConfig[]> {
    return this.priorityConfigRepository.find({
      where: { relation: In(entitities) },
    });
  }

  findOne(relation: ConfigRelation): Promise<PriorityConfig> {
    return this.priorityConfigRepository.findOne({
      where: { relation },
    });
  }

  async update(
    createPriorityConfigDto: CreatePriorityConfigDto,
  ): Promise<PriorityConfig> {
    const { entity, relation, dependencies } = createPriorityConfigDto;

    let totalScore = 0;
    const keys = new Set();

    for (const dependency of dependencies) {
      const { key, score, type, operator } = dependency;

      if (keys.has(key)) {
        throw new BadRequestException(`duplicate key '${key}'`);
      }

      if (score < 0 || score > 100) {
        throw new BadRequestException(`invalid score '${score}' for '${key}'`);
      }

      if (!this.isValidConfigKey(key, relation)) {
        throw new BadRequestException(`invalid key '${key}' for '${relation}'`);
      }

      if (!this.isValidOperator(type, operator)) {
        throw new BadRequestException(
          `operator '${operator}' is not compatible with type '${type}' for key '${key}'`,
        );
      }

      keys.add(key);
      totalScore += score;
    }

    if (totalScore > 100) {
      throw new BadRequestException(
        `total score exceeds 100, current: ${totalScore}`,
      );
    }

    let config = await this.findOne(relation);

    if (config) {
      config.dependencies = dependencies;
    } else {
      // payload
      const payload = {
        entity,
        relation,
        dependencies,
      };

      config = this.priorityConfigRepository.create(payload);
    }

    return this.priorityConfigRepository.save(config);
  }

  isValidConfigKey = (key: string, relation: ConfigRelation): boolean => {
    const map = {
      USER: UserKey,
      CROP: CropKey,
      FARM: FarmKey,
    };

    const prefix = relation.split(':')[0];

    return Object.values(map[prefix]).includes(key);
  };

  isValidValue = (
    type: DependencyType,
    value: DependencyValueType,
  ): boolean => {
    switch (type) {
      case DependencyType.STRING:
        return typeof value === 'string' && value.trim() !== '';

      case DependencyType.NUMBER:
        return typeof value === 'number';

      case DependencyType.BOOLEAN:
        return typeof value === 'boolean';

      case DependencyType.DATE:
        return value instanceof Date || !isNaN(Date.parse(value as string));

      case DependencyType.ARRAY_STRING:
        return (
          Array.isArray(value) &&
          value.every((item) => typeof item === 'string')
        );

      default:
        return false;
    }
  };

  isValidOperator(type: DependencyType, operator: DependencyOperator): boolean {
    const map = {
      [DependencyOperator.EQ]: [
        DependencyType.STRING,
        DependencyType.NUMBER,
        DependencyType.BOOLEAN,
      ],

      [DependencyOperator.GT]: [DependencyType.DATE, DependencyType.NUMBER],

      [DependencyOperator.LT]: [DependencyType.DATE, DependencyType.NUMBER],

      [DependencyOperator.GTE]: [DependencyType.DATE, DependencyType.NUMBER],

      [DependencyOperator.LTE]: [DependencyType.DATE, DependencyType.NUMBER],

      [DependencyOperator.CONTAINS]: [DependencyType.ARRAY_STRING],

      [DependencyOperator.IN]: [DependencyType.ARRAY_STRING],
    };

    return map[operator]?.includes(type) ?? false;
  }

  compare(left: any, right: any, operator: DependencyOperator): boolean {
    // if the left and right values are Date objects, convert them to timestamps
    if (left instanceof Date && right instanceof Date) {
      left = left.getTime();
      right = right.getTime();
    }

    switch (operator) {
      case DependencyOperator.EQ:
        return left === right;

      case DependencyOperator.GT:
        return left > right;

      case DependencyOperator.LT:
        return left < right;

      case DependencyOperator.GTE:
        return left >= right;

      case DependencyOperator.LTE:
        return left <= right;

      case DependencyOperator.CONTAINS:
        return typeof left === 'string'
          ? left.includes(right)
          : Array.isArray(left) && left.includes(right);

      case DependencyOperator.IN:
        return Array.isArray(right) && right.includes(left);

      default:
        throw new Error(`invalid operator '${operator}'`);
    }
  }

  calculateScore(
    data: ConfigRelationData,
    priorityConfigs: PriorityConfig[],
  ): number {
    let map = {
      [ConfigRelation.USER]: 0,
      [ConfigRelation.CROP]: 0,
      [ConfigRelation.CROP_FARM]: 0,
      [ConfigRelation.CROP_FARM_USER]: 0,
    };

    const extractValue = (key: string, relation: ConfigRelation) => {
      switch (relation) {
        case ConfigRelation.USER:
        case ConfigRelation.CROP:
          return data[key];

        case ConfigRelation.CROP_FARM:
          return data['farm']?.[key];

        case ConfigRelation.CROP_FARM_USER:
          return data['farm']?.['user']?.[key];

        default:
          return undefined;
      }
    };

    for (const { relation, dependencies } of priorityConfigs) {
      for (const { key, type, operator, ...rest } of dependencies) {
        const value = extractValue(key, relation);

        if (
          value !== undefined &&
          this.isValidValue(type, value) &&
          this.compare(value, rest.value, operator)
        ) {
          map[relation] += rest.score;
        }
      }
    }

    const scores = Object.values(map).filter((score) => score > 0);

    const average =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    return average;
  }
}
