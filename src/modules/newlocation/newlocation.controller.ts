import {
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpStatus,
  Controller,
} from '@nestjs/common';

import { NewLocation } from '@one-root/markhet-core';

import { NewLocationService } from './newlocation.service';

import { CreateNewLocationDto } from './dto/create-new-location.dto';

import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('newlocations')
export class NewLocationController {
  constructor(private readonly newlocationService: NewLocationService) {}

  @Get('coordinates')
  async getLatLngByAddress(
    @Query('address') address: string,
  ): Promise<ApiResponse<{ latitude: number; longitude: number }>> {
    const { lat, lng } =
      await this.newlocationService.getLatLngByAddress(address);

    return new ApiResponse(
      HttpStatus.OK,
      'coordinates retrieved successfully',
      { latitude: lat, longitude: lng },
    );
  }

  @Get('states')
  async getAllStates(): Promise<ApiResponse<string[]>> {
    const locations = await this.newlocationService.getAllStates();
    return new ApiResponse(
      HttpStatus.OK,
      'states fetched successfully',
      locations,
    );
  }

  @Get('districts')
  async getDistrictsByState(
    @Query('state') state: string,
  ): Promise<ApiResponse<string[]>> {
    const districts = await this.newlocationService.getDistrictsByState(state);
    return new ApiResponse(
      HttpStatus.OK,
      'districts fetched successfully',
      districts,
    );
  }

  @Get('taluks')
  async getTaluksByDistrict(
    @Query('state') state: string,
    @Query('district') district: string,
  ): Promise<ApiResponse<string[]>> {
    const taluks = await this.newlocationService.getTaluksByDistrict(
      state,
      district,
    );
    return new ApiResponse(
      HttpStatus.OK,
      'taluks fetched successfully',
      taluks,
    );
  }

  @Get('villages')
  async getVillagesByTaluk(
    @Query('state') state: string,
    @Query('district') district: string,
    @Query('taluk') taluk: string,
  ): Promise<ApiResponse<string[]>> {
    const villages = await this.newlocationService.getVillagesByTaluk(
      state,
      district,
      taluk,
    );
    return new ApiResponse(
      HttpStatus.OK,
      'villages fetched successfully',
      villages,
    );
  }
  @Get('reverse-geocode')
  async getLocationByCoordinates(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ): Promise<ApiResponse<any>> {
    const details =
      await this.newlocationService.getLocationDetailsByCoordinates(
        latitude,
        longitude,
      );
    return new ApiResponse(
      HttpStatus.OK,
      'location details fetched successfully',
      details,
    );
  }

  @Post()
  async createLocation(
    @Body() createNewLocationDto: CreateNewLocationDto,
  ): Promise<ApiResponse<NewLocation>> {
    const location = await this.newlocationService.create(createNewLocationDto);

    return new ApiResponse(
      HttpStatus.CREATED,
      'location created successfully',
      location,
    );
  }
}
