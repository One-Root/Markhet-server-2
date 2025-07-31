import {
  Req,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  Banana,
  Turmeric,
  DryCoconut,
  TenderCoconut,
} from '@one-root/markhet-core';

import { CropService } from './crop.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { CreateBananaDto } from './dto/create-banana.dto';
import { CreateTurmericDto } from './dto/create-turmeric.dto';
import { CreateDryCoconutDto } from './dto/create-dry-coconut.dto';
import { CreateTenderCoconutDto } from './dto/create-tender-coconut.dto';
import { UpdateBananaDto } from './dto/update-banana.dto';
import { UpdateTurmericDto } from './dto/update-turmeric.dto';
import { UpdateDryCoconutDto } from './dto/update-dry-coconut.dto';
import { UpdateTenderCoconutDto } from './dto/update-tender-coconut.dto';
import { GetCropsQueryParamsDto } from './dto/get-crops-query-params.dto';

import { CropType } from '../../common/types/crop.type';
import { CropName } from '../../common/enums/farm.enum';
import { CustomRequest } from '../../common/interfaces/express.interface';
import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('crops')
@UseGuards(JwtAuthGuard, SessionGuard)
export class CropController {
  constructor(private readonly cropService: CropService) {}

  @Get()
  async getCrops(
    @Query() params: GetCropsQueryParamsDto,
    @Req() request: CustomRequest,
  ): Promise<ApiResponse<CropType[]>> {
    const crops = await this.cropService.findAll(params, request);

    return new ApiResponse(
      HttpStatus.OK,
      'crops retrieved successfully',
      crops,
    );
  }

  @Get(':id')
  async getCrop(
    @Query() params: { cropName: CropName },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<CropType>> {
    const { cropName } = params;

    const crop = await this.cropService.findOne(cropName, id);

    return new ApiResponse(HttpStatus.OK, 'crop retrieved successfully', crop);
  }

  @Post(':farmId/tender-coconut')
  async createTenderCoconutCrop(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() createTenderCoconutDto: CreateTenderCoconutDto,
  ): Promise<ApiResponse<TenderCoconut>> {
    const crop = await this.cropService.createTenderCoconut(
      farmId,
      createTenderCoconutDto,
    );

    return new ApiResponse(
      HttpStatus.CREATED,
      'crop created successfully',
      crop,
    );
  }

  @Post(':farmId/turmeric')
  async createTurmericCrop(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() createTurmericDto: CreateTurmericDto,
  ): Promise<ApiResponse<Turmeric>> {
    const crop = await this.cropService.createTurmeric(
      farmId,
      createTurmericDto,
    );

    return new ApiResponse(
      HttpStatus.CREATED,
      'crop created successfully',
      crop,
    );
  }

  @Post(':farmId/banana')
  async createBananaCrop(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() createBananaDto: CreateBananaDto,
  ): Promise<ApiResponse<Banana>> {
    const crop = await this.cropService.createBanana(farmId, createBananaDto);

    return new ApiResponse(
      HttpStatus.CREATED,
      'crop created successfully',
      crop,
    );
  }

  @Post(':farmId/dry-coconut')
  async createDryCoconutCrop(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() createDryCoconutDto: CreateDryCoconutDto,
  ): Promise<ApiResponse<DryCoconut>> {
    const crop = await this.cropService.createDryCoconut(
      farmId,
      createDryCoconutDto,
    );

    return new ApiResponse(
      HttpStatus.CREATED,
      'crop created successfully',
      crop,
    );
  }

  @Patch('tender-coconut/:cropId')
  async updateTenderCoconut(
    @Param('cropId', ParseUUIDPipe) cropId: string,
    @Body() updateTenderCoconutDto: UpdateTenderCoconutDto,
  ): Promise<ApiResponse<TenderCoconut>> {
    const crop = await this.cropService.updateTenderCoconut(
      cropId,
      updateTenderCoconutDto,
    );

    return new ApiResponse(HttpStatus.OK, 'crop updated successfully', crop);
  }

  @Patch('turmeric/:cropId')
  async updateTurmeric(
    @Param('cropId', ParseUUIDPipe) cropId: string,
    @Body() updateTurmericDto: UpdateTurmericDto,
  ): Promise<ApiResponse<Turmeric>> {
    const crop = await this.cropService.updateTurmeric(
      cropId,
      updateTurmericDto,
    );

    return new ApiResponse(HttpStatus.OK, 'crop updated successfully', crop);
  }

  @Patch('banana/:cropId')
  async updateBanana(
    @Param('cropId', ParseUUIDPipe) cropId: string,
    @Body() updateBananaDto: UpdateBananaDto,
  ): Promise<ApiResponse<Banana>> {
    const crop = await this.cropService.updateBanana(cropId, updateBananaDto);

    return new ApiResponse(HttpStatus.OK, 'crop updated successfully', crop);
  }

  @Patch('dry-coconut/:cropId')
  async updateDryCoconut(
    @Param('cropId', ParseUUIDPipe) cropId: string,
    @Body() updateDryCoconutDto: UpdateDryCoconutDto,
  ): Promise<ApiResponse<DryCoconut>> {
    const crop = await this.cropService.updateDryCoconut(
      cropId,
      updateDryCoconutDto,
    );

    return new ApiResponse(HttpStatus.OK, 'crop updated successfully', crop);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCrop(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() params: { cropName: CropName },
  ) {
    await this.cropService.remove(id, params.cropName);
  }
}
