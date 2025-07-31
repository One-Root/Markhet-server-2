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
}
