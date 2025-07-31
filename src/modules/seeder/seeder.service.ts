import * as fs from 'fs';
import * as path from 'path';

import { Logger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Location } from '@one-root/markhet-core';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async seedLocations(): Promise<void> {
    try {
      const filePath = path.join(__dirname, 'data', 'locations-json.json');

      const data = fs.readFileSync(filePath, 'utf-8');

      const json = JSON.parse(data);

      const batchSize = 1000;
      const totalRecords = json.length;

      for (let i = 0; i < totalRecords; i += batchSize) {
        const batch = json.slice(i, i + batchSize);

        const locations = batch.map((location: any) =>
          this.locationRepository.create({
            village: location.village,
            officeName: location.officeName,
            pincode: location.pincode,
            taluk: location.taluk,
            district: location.district,
            state: location.state,
          }),
        );

        await this.locationRepository.save(locations);
      }

      this.logger.log('locations injected successfully');
    } catch (error) {
      console.error('error reading or inserting location data : ', error);
    }
  }
}
