import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { plainToClass } from 'class-transformer';

import { Market, MarketPrice } from '@one-root/markhet-core';

import { CreateMarketDto } from './dto/create-market.dto';
import { GetMarketsQueryParamsDto } from './dto/get-markets-query-params.dto';

import { applyOperator } from '../../common/utils/apply-operator.util';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(Market) private marketRepository: Repository<Market>,
  ) {}

  async create(createMarketDto: CreateMarketDto): Promise<Market> {
    const market = this.marketRepository.create(createMarketDto);

    return this.marketRepository.save(market);
  }

  async findAll(params: GetMarketsQueryParamsDto): Promise<Market[]> {
    const {
      page = 1,
      limit = 10,
      ...rest
    } = plainToClass(GetMarketsQueryParamsDto, params);

    const skip = (page - 1) * limit;

    // initialize conditions
    const marketConditions: Record<string, any> = {};

    // parse filters
    for (const [key, value] of Object.entries(rest)) {
      const [field, operator] = key.split('__');

      marketConditions[field] = operator
        ? applyOperator(operator, value)
        : value;
    }

    // combine conditions
    const conditions: Record<string, any> = {
      ...(Object.keys(marketConditions).length && marketConditions),
    };

    const options = {
      skip,
      take: limit,
      where: conditions,
      relations: ['marketPrices'],
    };

    const markets = await this.marketRepository.find(options);

    for (const market of markets) {
      const map = new Map<string, MarketPrice>();

      // filter to keep only the latest entries
      for (const marketPrice of market.marketPrices) {
        const key = `${marketPrice.cropName}-${marketPrice.cropVariety}`;

        if (!map.has(key) || map.get(key).createdAt < marketPrice.createdAt)
          map.set(key, marketPrice);
      }

      market.marketPrices = Array.from(map.values());
    }

    return markets;
  }

  async findOne(id: string): Promise<Market> {
    const market = await this.marketRepository.findOne({
      where: { id },
    });

    if (!market) {
      throw new NotFoundException(`market with id ${id} not found`);
    }

    return market;
  }
}
