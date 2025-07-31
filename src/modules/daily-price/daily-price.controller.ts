import {
  Get,
  Req,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Controller,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';

import { DailyPrice } from '@one-root/markhet-core';

import { DailyPriceService } from './daily-price.service';
import { CreateDailyPriceDto } from './dto/create-daily-price.dto';
import { UpdateDailyPriceDto } from './dto/update-daily-price.dto';
import { GetDailyPricesQueryParamsDto } from './dto/get-daily-prices-query-params.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { CustomRequest } from '../../common/interfaces/express.interface';
import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

import { CropName } from '../../common/enums/farm.enum';

@Controller('daily-prices')
@UseGuards(JwtAuthGuard, SessionGuard)
export class DailyPriceController {
  constructor(private readonly dailyPriceService: DailyPriceService) {}

  @Get('crop/:cropName')
  async getDailyPricesByCrop(
    @Param('cropName') cropName: CropName,
    @Query() params: GetDailyPricesQueryParamsDto,
  ): Promise<ApiResponse<DailyPrice[]>> {
    const dailyPrices = await this.dailyPriceService.findByCrop(
      cropName,
      params,
    );

    return new ApiResponse(
      HttpStatus.OK,
      'daily prices retrieved successfully',
      dailyPrices,
    );
  }

  @Get()
  async getDailyPrices(
    @Req() req: CustomRequest,
  ): Promise<ApiResponse<DailyPrice[]>> {
    const dailyPrices = await this.dailyPriceService.findAll(req.user.id);

    return new ApiResponse(
      HttpStatus.OK,
      'daily prices retrieved successfully',
      dailyPrices,
    );
  }

  @Get(':id')
  async getDailyPrice(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<DailyPrice>> {
    const dailyPrice = await this.dailyPriceService.findOne(id);

    return new ApiResponse(
      HttpStatus.OK,
      'daily price retrieved successfully',
      dailyPrice,
    );
  }

  @Post()
  async createDailyPrice(
    @Req() req: CustomRequest,
    @Body() createDailyPriceDto: CreateDailyPriceDto,
  ): Promise<ApiResponse<DailyPrice>> {
    const dailyPrice = await this.dailyPriceService.create(
      req.user,
      createDailyPriceDto,
    );

    return new ApiResponse(
      HttpStatus.CREATED,
      'daily price created successfully',
      dailyPrice,
    );
  }

  @Patch(':id')
  async updateDailyPrice(
    @Param('id') id: string,
    @Req() req: CustomRequest,
    @Body() updateDailyPriceDto: UpdateDailyPriceDto,
  ): Promise<ApiResponse<DailyPrice>> {
    const dailyPrice = await this.dailyPriceService.updatePrice(
      id,
      req.user,
      updateDailyPriceDto,
    );

    return new ApiResponse(
      HttpStatus.OK,
      'daily price updated successfully',
      dailyPrice,
    );
  }
}
