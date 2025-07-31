import {
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Controller,
  HttpStatus,
} from '@nestjs/common';

import { Market } from '@one-root/markhet-core';

import { MarketService } from './market.service';

import { CreateMarketDto } from './dto/create-market.dto';
import { GetMarketsQueryParamsDto } from './dto/get-markets-query-params.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('markets')
@UseGuards(JwtAuthGuard, SessionGuard)
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post()
  async createMarket(
    @Body() createMarketDto: CreateMarketDto,
  ): Promise<ApiResponse<Market>> {
    const market = await this.marketService.create(createMarketDto);

    return new ApiResponse(
      HttpStatus.CREATED,
      'market created successfully',
      market,
    );
  }

  @Get()
  async getMarkets(
    @Query() params: GetMarketsQueryParamsDto,
  ): Promise<ApiResponse<Market[]>> {
    const markets = await this.marketService.findAll(params);

    return new ApiResponse(
      HttpStatus.CREATED,
      'markets retrieved successfully',
      markets,
    );
  }
}
