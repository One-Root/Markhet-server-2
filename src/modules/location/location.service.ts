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

  async getAllStates(): Promise<string[]> {
    const results = await this.locationRepository
      .createQueryBuilder('location')
      .select('DISTINCT location.state', 'state')
      .getRawMany();

    return results.map((r) => r.state);
  }

  async getDistrictsByState(state: string): Promise<string[]> {
    const results = await this.locationRepository
      .createQueryBuilder('location')
      .select('DISTINCT location.district', 'district')
      .where('LOWER(location.state) = LOWER(:state)', { state })
      .getRawMany();
    console.log('Raw district results:', results);

    return results.map((r) => r.district);
  }

  async getTaluksByDistrict(
    state: string,
    district: string,
  ): Promise<string[]> {
    const results = await this.locationRepository
      .createQueryBuilder('location')
      .select('DISTINCT location.taluk', 'taluk')
      .where('LOWER(location.state) = LOWER(:state)', { state })
      .andWhere('LOWER(location.district) = LOWER(:district)', { district })
      .getRawMany();

    return results.map((r) => r.taluk);
  }

  async getVillagesByTaluk(
    state: string,
    district: string,
    taluk: string,
  ): Promise<string[]> {
    const results = await this.locationRepository
      .createQueryBuilder('location')
      .select('DISTINCT location.village', 'village')
      .where('LOWER(location.state) = LOWER(:state)', { state })
      .andWhere('LOWER(location.district) = LOWER(:district)', { district })
      .andWhere('LOWER(location.taluk) = LOWER(:taluk)', { taluk })
      .getRawMany();

    return results.map((r) => r.village);
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

  async getPincodeByLocation(
    state: string,
    district: string,
    taluk: string,
    village: string,
  ): Promise<string> {
    const s = state.trim();
    const d = district.trim();
    const t = taluk.trim();
    const v = village.trim();

    const location = await this.locationRepository
      .createQueryBuilder('location')
      .where('LOWER(TRIM(location.state)) = LOWER(:state)', { state: s })
      .andWhere('LOWER(TRIM(location.district)) = LOWER(:district)', {
        district: d,
      })
      .andWhere('LOWER(TRIM(location.taluk)) = LOWER(:taluk)', { taluk: t })
      .andWhere('LOWER(TRIM(location.village)) = LOWER(:village)', {
        village: v,
      })
      .getOne();

    if (!location) {
      throw new HttpException(
        `No pincode found for location: ${v}, ${t}, ${d}, ${s}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return location.pincode;
  }
}
