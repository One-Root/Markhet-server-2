import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';

import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { Location } from '@one-root/markhet-core';

import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationService {
  private readonly apiKey = process.env.GCP_GOOGLE_MAPS_API_KEY;
  private readonly endpoint =
    'https://maps.googleapis.com/maps/api/geocode/json';

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,

    private readonly httpService: HttpService,
  ) {}

  find(pincode: string): Promise<Location[]> {
    return this.locationRepository.find({
      where: { pincode },
    });
  }

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationRepository.create(createLocationDto);

    return this.locationRepository.save(location);
  }

  async getLatLngByAddress(
    address: string,
  ): Promise<{ lat: number; lng: number }> {
    const response = await firstValueFrom(
      this.httpService.get(this.endpoint, {
        params: {
          address: address,
          key: this.apiKey,
        },
      }),
    );

    if (response.data.status === 'OK') {
      const result = response.data.results[0];

      const lat = result.geometry.location.lat;
      const lng = result.geometry.location.lng;

      return { lat, lng };
    } else {
      throw new HttpException(
        'unable to fetch coordinates for the provided address',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
