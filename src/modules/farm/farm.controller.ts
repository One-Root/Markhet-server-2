import {
  Req,
  Get,
  Post,
  Body,
  Patch,
  Query,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  HttpStatus,
  Controller,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Farm } from '@one-root/markhet-core';

import { FarmService } from './farm.service';

import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { GetFarmCoordinatesQueryParamsDto } from './dto/get-farm-coordinates-query-params.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { CustomRequest } from '../../common/interfaces/express.interface';
import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('farms')
@UseGuards(JwtAuthGuard, SessionGuard)
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Get('coordinates')
  async getFarmCoordinates(
    @Query() params: GetFarmCoordinatesQueryParamsDto,
  ): Promise<ApiResponse<Farm[]>> {
    const farms = await this.farmService.findCoordinates(params);

    return new ApiResponse(
      HttpStatus.OK,
      'farm coordinates retrieved successfully',
      farms,
    );
  }

  @Get()
  async getFarms(@Req() req: CustomRequest): Promise<ApiResponse<Farm[]>> {
    const farms = await this.farmService.findAll(req.user);

    return new ApiResponse(
      HttpStatus.OK,
      'farms retrieved successfully',
      farms,
    );
  }

  @Get(':id')
  async getFarm(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<Farm>> {
    const farm = await this.farmService.findOne(id);

    return new ApiResponse(HttpStatus.OK, 'farm retrieved successfully', farm);
  }

  @Post()
  async createFarm(
    @Req() req: CustomRequest,
    @Body() createFarmDto: CreateFarmDto,
  ): Promise<ApiResponse<Farm>> {
    const farm = await this.farmService.create(req.user, createFarmDto);

    return new ApiResponse(
      HttpStatus.CREATED,
      'farm created successfully',
      farm,
    );
  }

  @Patch(':id')
  async updateFarm(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFarmDto: UpdateFarmDto,
  ): Promise<ApiResponse<Farm>> {
    const updatedFarm = await this.farmService.update(id, updateFarmDto);

    return new ApiResponse(
      HttpStatus.OK,
      'farm updated successfully',
      updatedFarm,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFarm(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.farmService.remove(id);
  }
}
