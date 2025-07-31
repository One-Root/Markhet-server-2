import {
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Controller,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';

import { MarketPrice } from '@one-root/markhet-core';

import { MarketPriceService } from './market-price.service';

import { CreateMarketPriceDto } from './dto/create-market-price.dto';
import { GetMarketPricesQueryParamsDto } from './dto/get-market-prices-query-params.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('market-prices')
@UseGuards(JwtAuthGuard, SessionGuard)
export class MarketPriceController {
  constructor(private readonly marketPriceService: MarketPriceService) {}

  @Post()
  async createMarketPrice(
    @Body() createMarketPriceDto: CreateMarketPriceDto,
  ): Promise<ApiResponse<MarketPrice>> {
    const marketPrice =
      await this.marketPriceService.create(createMarketPriceDto);

    return new ApiResponse(
      HttpStatus.CREATED,
      'market price created successfully',
      marketPrice,
    );
  }

  @Get(':marketId')
  async getMarketPrices(
    @Query() params: GetMarketPricesQueryParamsDto,
    @Param('marketId', ParseUUIDPipe) marketId: string,
  ): Promise<ApiResponse<MarketPrice[]>> {
    const marketPrices = await this.marketPriceService.findAll(
      marketId,
      params,
    );

    return new ApiResponse(
      HttpStatus.CREATED,
      'market prices retrieved successfully',
      marketPrices,
    );
  }
}
