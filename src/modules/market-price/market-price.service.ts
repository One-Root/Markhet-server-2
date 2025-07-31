import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { plainToClass } from 'class-transformer';

import { MarketPrice } from '@one-root/markhet-core';

import { CropService } from '../crop/crop.service';
import { MarketService } from '../market/market.service';

import { CreateMarketPriceDto } from './dto/create-market-price.dto';
import { GetMarketPricesQueryParamsDto } from './dto/get-market-prices-query-params.dto';

import { applyOperator } from '../../common/utils/apply-operator.util';

@Injectable()
export class MarketPriceService {
  constructor(
    @InjectRepository(MarketPrice)
    private marketPriceRepository: Repository<MarketPrice>,

    private readonly cropService: CropService,

    private readonly marketService: MarketService,
  ) {}

  async create(
    createMarketPriceDto: CreateMarketPriceDto,
  ): Promise<MarketPrice> {
    const { marketId, cropName, cropVariety, grade, price } =
      createMarketPriceDto;

    const market = await this.marketService.findOne(marketId);

    if (!Object.values(market.cropNames).includes(cropName)) {
      throw new BadRequestException(
        `market with id '${marketId}' does not have the crop '${cropName}'`,
      );
    }

    const valid = this.cropService.isValidVariety(cropName, cropVariety);

    if (!valid) {
      throw new BadRequestException(
        `invalid variety '${cropVariety}' for crop '${cropName}'`,
      );
    }

    // payload
    const payload = {
      cropName,
      cropVariety,
      grade,
      price,
      market,
    };

    const marketPrice = this.marketPriceRepository.create(payload);

    return this.marketPriceRepository.save(marketPrice);
  }

  async findAll(
    marketId: string,
    params: GetMarketPricesQueryParamsDto,
  ): Promise<MarketPrice[]> {
    const { ...rest } = plainToClass(GetMarketPricesQueryParamsDto, params);

    // initialize conditions
    const marketPriceConditions: Record<string, any> = {
      market: { id: marketId },
    };

    // parse filters
    for (const [key, value] of Object.entries(rest)) {
      const [field, operator] = key.split('__');

      marketPriceConditions[field] = operator
        ? applyOperator(operator, value)
        : value;
    }

    // combine conditions
    const conditions: Record<string, any> = {
      ...(Object.keys(marketPriceConditions).length && marketPriceConditions),
    };

    const options = {
      where: conditions,
      relations: ['market'],
      order: { createdAt: 'DESC' as const },
    };

    const marketPrices = await this.marketPriceRepository.find(options);

    // filter to keep only the latest entries
    const map = new Map<string, MarketPrice>();

    for (const marketPrice of marketPrices) {
      const key = `${marketPrice.cropName}-${marketPrice.cropVariety}`;

      if (!map.has(key)) map.set(key, marketPrice);
    }

    return Array.from(map.values());
  }
}
