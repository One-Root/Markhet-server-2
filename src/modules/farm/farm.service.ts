import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { Repository } from 'typeorm';

import { plainToClass } from 'class-transformer';

import { User, Farm } from '@one-root/markhet-core';

import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { GetFarmCoordinatesQueryParamsDto } from './dto/get-farm-coordinates-query-params.dto';

import { applyOperator } from '../../common/utils/apply-operator.util';

@Injectable()
export class FarmService {
  constructor(
    @InjectRepository(Farm)
    private readonly farmRepository: Repository<Farm>,
  ) {}

  async create(user: User, createFarmDto: CreateFarmDto): Promise<Farm> {
    const farm = this.farmRepository.create({
      ...createFarmDto,
      user,
    });

    return this.farmRepository.save(farm);
  }

  async findAll(user: User): Promise<Farm[]> {
    return this.farmRepository.find({
      where: { user: { id: user.id } },
      relations: ['user', 'crops'],
    });
  }

  async findCoordinates(
    params: GetFarmCoordinatesQueryParamsDto,
  ): Promise<Farm[]> {
    const { ...rest } = plainToClass(GetFarmCoordinatesQueryParamsDto, params);

    // initialize conditions
    const farmConditions: Record<string, any> = {};

    // parse filters
    for (const [key, value] of Object.entries(rest)) {
      const [field, operator] = key.split('__');

      farmConditions[field] = operator ? applyOperator(operator, value) : value;
    }

    // combine conditions
    const conditions: Record<string, any> = {
      ...farmConditions,
    };

    return this.farmRepository.find({
      where: conditions,
      select: ['id', 'coordinates'],
    });
  }

  async findOne(id: string): Promise<Farm> {
    const farm = await this.farmRepository.findOne({
      where: { id },
      relations: ['user', 'crops'],
    });

    if (!farm) {
      throw new NotFoundException(`farm with id ${id} not found`);
    }

    return farm;
  }

  async update(id: string, updateFarmDto: UpdateFarmDto): Promise<Farm> {
    const farm = await this.findOne(id);

    Object.assign(farm, updateFarmDto);

    return this.farmRepository.save(farm);
  }

  async remove(id: string): Promise<void> {
    const farm = await this.findOne(id);

    if (!farm) {
      throw new NotFoundException(`farm with id ${id} not found`);
    }

    await this.farmRepository.remove(farm);
  }
}
