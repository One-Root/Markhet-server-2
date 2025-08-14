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
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';

import {
  Banana,
  Turmeric,
  DryCoconut,
  TenderCoconut,
  Sunflower,
  Maize,
} from '@one-root/markhet-core';

import { CropService } from './crop.service';
import { FilesInterceptor } from '@nestjs/platform-express';

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
import { CreateSunflowerDto } from './dto/create-sunflower.dto';
import { UpdateSunflowerDto } from './dto/update-sunflower.dto';

import { CropType } from '../../common/types/crop.type';
import { CropName } from '../../common/enums/farm.enum';
import { CustomRequest } from '../../common/interfaces/express.interface';
import { ApiResponse } from '../../common/interceptors/api-response.interceptor';
import { CROP_IMAGE_MAP } from '../../common/constants/crop-images.constant';
import { AuthGuard } from '@nestjs/passport';
import { CreateMaizeDto } from './dto/create-maize.dto';
import { CropStatusEnum } from '../../common/enums/farm.enum';

@Controller('crops')
// @UseGuards(JwtAuthGuard, SessionGuard)
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

  @Post(':farmId/sunflower')
  @UseGuards(JwtAuthGuard, SessionGuard)
  async createSunflowerCrop(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() createSunflowerDto: CreateSunflowerDto,
  ): Promise<ApiResponse<Sunflower>> {
    const crop = await this.cropService.createSunflower(
      farmId,
      createSunflowerDto,
    );

    return new ApiResponse(
      HttpStatus.CREATED,
      'crop created successfully',
      crop,
    );
  }
  @Post(':farmId/maize')
  @UseGuards(JwtAuthGuard, SessionGuard)
  async createMaizeCrop(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() createMaizeDto: CreateMaizeDto,
  ): Promise<ApiResponse<Maize>> {
    const crop = await this.cropService.createMaize(farmId, createMaizeDto);
    return new ApiResponse(
      HttpStatus.CREATED,
      'maize crop created succesfully',
      crop,
    );
  }

  @Get('available-types')
  getAvailableCropTypes(): ApiResponse<
    { name: string; value: string; imageUrl: string }[]
  > {
    const availableCropsWithImages = Object.values(CropName).map(
      (cropValue) => ({
        name: cropValue,
        value: cropValue,
        imageUrl: CROP_IMAGE_MAP[cropValue] || null,
      }),
    );

    return new ApiResponse(
      HttpStatus.OK,
      'Available crop types with images retrieved successfully',
      availableCropsWithImages,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  async getCrop(
    @Query() params: { cropName: CropName },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<CropType>> {
    const { cropName } = params;

    const crop = await this.cropService.findOne(cropName, id);

    return new ApiResponse(HttpStatus.OK, 'crop retrieved successfully', crop);
  }

  @Post(':farmId/tender-coconut')
  @UseGuards(JwtAuthGuard, SessionGuard)
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
  @UseGuards(JwtAuthGuard, SessionGuard)
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
  @UseGuards(JwtAuthGuard, SessionGuard)
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
  @UseGuards(JwtAuthGuard, SessionGuard)
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
  @UseGuards(JwtAuthGuard, SessionGuard)
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
  @UseGuards(JwtAuthGuard, SessionGuard)
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
  @UseGuards(JwtAuthGuard, SessionGuard)
  async updateBanana(
    @Param('cropId', ParseUUIDPipe) cropId: string,
    @Body() updateBananaDto: UpdateBananaDto,
  ): Promise<ApiResponse<Banana>> {
    const crop = await this.cropService.updateBanana(cropId, updateBananaDto);

    return new ApiResponse(HttpStatus.OK, 'crop updated successfully', crop);
  }

  @Patch('dry-coconut/:cropId')
  @UseGuards(JwtAuthGuard, SessionGuard)
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

  @Patch('sunflower/:cropId')
  @UseGuards(JwtAuthGuard, SessionGuard)
  async updateSunflower(
    @Param('cropId', ParseUUIDPipe) cropId: string,
    @Body() UpdateSunflowerDto: UpdateSunflowerDto,
  ): Promise<ApiResponse<Sunflower>> {
    const crop = await this.cropService.updateSunflower(
      cropId,
      UpdateSunflowerDto,
    );

    return new ApiResponse(HttpStatus.OK, 'crop updated successfully', crop);
  }

  @Get('available-crops')
  async getAvailableCrops(): Promise<ApiResponse<string[]>> {
    const cropNames = Object.values(CropName);
    return new ApiResponse(
      HttpStatus.OK,
      'available crops retrieved successfully',
      cropNames,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCrop(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() params: { cropName: CropName },
  ) {
    await this.cropService.remove(id, params.cropName);
  }
  @Post(':cropName/:id/upload')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @UseInterceptors(FilesInterceptor('images'))
  async uploadCropImages(
    @Param('cropName') cropName: CropName,
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('coordinates') coordinatesJson?: string,
  ) {
    let coordinates: [number, number] | undefined;

    if (coordinatesJson) {
      try {
        const parsed = JSON.parse(coordinatesJson);
        if (
          !Array.isArray(parsed) ||
          parsed.length !== 2 ||
          !parsed.every((num) => typeof num === 'number')
        ) {
          throw new Error();
        }
        coordinates = parsed as [number, number];
      } catch {
        throw new BadRequestException(
          'Invalid coordinates format. Must be JSON array of two numbers.',
        );
      }
    }

    return this.cropService.uploadCropImagesAndCoordinates(
      cropName,
      id,
      files,
      coordinates,
    );
  }
  @Get('alert/get-crop-alerts/:farmId')
  @UseGuards(JwtAuthGuard, SessionGuard)
  async getCropAlerts(
    @Param('farmId', ParseUUIDPipe) farmId: string,
  ): Promise<ApiResponse<any[]>> {
    const alerts = await this.cropService.getCropAlerts(farmId);

    return new ApiResponse(
      HttpStatus.OK,
      'crop alerts retrieved successfully',
      alerts,
    );
  }
  @Delete(':cropName/:id/images')
  @UseGuards(JwtAuthGuard, SessionGuard)
  async deleteCropImages(
    @Param('cropName') cropName: CropName,
    @Param('id') id: string,
    @Body('imageUrls') imageUrls: string[],
  ) {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      throw new BadRequestException('imageUrls must be a non-empty array');
    }

    return this.cropService.deleteCropImages(cropName, id, imageUrls);
  }
}
