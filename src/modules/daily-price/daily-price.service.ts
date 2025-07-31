import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Between, Repository } from 'typeorm';

import { plainToClass } from 'class-transformer';

import { User, DailyPrice } from '@one-root/markhet-core';

import { CropService } from '../crop/crop.service';

import { CreateDailyPriceDto } from './dto/create-daily-price.dto';
import { UpdateDailyPriceDto } from './dto/update-daily-price.dto';
import { GetDailyPricesQueryParamsDto } from './dto/get-daily-prices-query-params.dto';

import { CropName } from '../../common/enums/farm.enum';

import { applyOperator } from '../../common/utils/apply-operator.util';

@Injectable()
export class DailyPriceService {
  constructor(
    @InjectRepository(DailyPrice)
    private readonly dailyPriceRepository: Repository<DailyPrice>,

    private readonly cropService: CropService,
  ) {}

  async findAll(userId: string): Promise<DailyPrice[]> {
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const end = new Date();

    return this.dailyPriceRepository.find({
      where: { user: { id: userId }, createdAt: Between(start, end) },
      relations: ['user'],
    });
  }

  async findByCrop(
    cropName: CropName,
    params: GetDailyPricesQueryParamsDto,
  ): Promise<DailyPrice[]> {
    const {
      page = 1,
      limit = 10,
      ...rest
    } = plainToClass(GetDailyPricesQueryParamsDto, params);

    const skip = (page - 1) * limit;

    const start = new Date();
    start.setDate(start.getDate() - 7);

    const end = new Date();

    // initialize conditions
    const userConditions: Record<string, any> = {};

    // parse filters
    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith('user__')) {
        const userField = key.replace('user__', '');

        const [field, operator] = userField.split('__');

        userConditions[field] = operator
          ? applyOperator(operator, value)
          : value;
      }
    }

    // combine conditions
    const conditions: Record<string, any> = {
      cropName,
      createdAt: Between(start, end),
      user: { ...userConditions },
    };

    return this.dailyPriceRepository.find({
      skip,
      take: limit,
      where: conditions,
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<DailyPrice> {
    const dailyPrice = await this.dailyPriceRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!dailyPrice) {
      throw new NotFoundException(`daily price with id ${id} not found`);
    }

    return dailyPrice;
  }

  async create(
    user: User,
    createDailyPriceDto: CreateDailyPriceDto,
  ): Promise<DailyPrice> {
    const { cropName, cropVariety, price } = createDailyPriceDto;

    const valid = this.cropService.isValidVariety(cropName, cropVariety);

    if (!valid) {
      throw new BadRequestException(
        `invalid variety '${cropVariety}' for crop '${cropName}'`,
      );
    }

    const dailyPrice = this.dailyPriceRepository.create({
      cropName,
      cropVariety,
      price,
      user,
    });

    return this.dailyPriceRepository.save(dailyPrice);
  }

  async updatePrice(
    id: string,
    user: User,
    updateDailyPriceDto: UpdateDailyPriceDto,
  ): Promise<DailyPrice> {
    const dailyPrice = await this.dailyPriceRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!dailyPrice) {
      throw new NotFoundException(`daily price with id ${id} not found.`);
    }

    dailyPrice.price = updateDailyPriceDto.price;

    return this.dailyPriceRepository.save(dailyPrice);
  }
}
