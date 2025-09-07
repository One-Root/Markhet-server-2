import {
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpStatus,
  Controller,
} from '@nestjs/common';

import { Location } from '@one-root/markhet-core';

import { LocationService } from './location.service';

import { CreateLocationDto } from './dto/create-location.dto';

import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('coordinates')
  async getLatLngByAddress(
    @Query('address') address: string,
  ): Promise<ApiResponse<{ latitude: number; longitude: number }>> {
    const { lat, lng } = await this.locationService.getLatLngByAddress(address);

    return new ApiResponse(
      HttpStatus.OK,
      'coordinates retrieved successfully',
      { latitude: lat, longitude: lng },
    );
  }

  @Get('states')
  async getAllStates(): Promise<ApiResponse<string[]>> {
    const locations = await this.locationService.getAllStates();
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
    const districts = await this.locationService.getDistrictsByState(state);
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
    const taluks = await this.locationService.getTaluksByDistrict(
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
    const villages = await this.locationService.getVillagesByTaluk(
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

  @Get(':pincode')
  async getLocationByPincode(
    @Param('pincode') pincode: string,
  ): Promise<ApiResponse<Location[]>> {
    const locations = await this.locationService.find(pincode);

    return new ApiResponse(
      HttpStatus.OK,
      'locations retrieved successfully',
      locations,
    );
  }

  @Post()
  async createLocation(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<ApiResponse<Location>> {
    const location = await this.locationService.create(createLocationDto);

    return new ApiResponse(
      HttpStatus.CREATED,
      'location created successfully',
      location,
    );
  }

  @Get('pincode/by-location')
  async getPincodeByLocation(
    @Query('state') state: string,
    @Query('district') district: string,
    @Query('taluk') taluk: string,
    @Query('village') village: string,
  ): Promise<ApiResponse<string>> {
    const pincodes = await this.locationService.getPincodeByLocation(
      state,
      district,
      taluk,
      village,
    );
    return new ApiResponse(
      HttpStatus.OK,
      'pincodes fetched successfully',
      pincodes,
    );
  }
}
