import * as fs from 'fs';
import * as path from 'path';

import { Logger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

// import { Location } from '@one-root/markhet-core';
import { NewLocation } from '@one-root/markhet-core';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(NewLocation)
    private readonly newlLocationRepository: Repository<NewLocation>,
  ) {}

  async seedLocations(): Promise<void> {
    try {
      const filePath = path.join(__dirname, 'data', 'Andhra.json');

      const data = fs.readFileSync(filePath, 'utf-8');

      const json = JSON.parse(data);

      const batchSize = 1000;
      const totalRecords = json.length;

      for (let i = 0; i < totalRecords; i += batchSize) {
        const batch = json.slice(i, i + batchSize);

        const newlocations = batch.map((newlocations: any) =>
          this.newlLocationRepository.create({
            village: newlocations.village,

            taluk: newlocations.taluk,
            district: newlocations.district,
            state: newlocations.state,
          }),
        );

        await this.newlLocationRepository.save(newlocations);
      }

      this.logger.log('locations injected successfully');
    } catch (error) {
      console.error('error reading or inserting location data : ', error);
    }
  }
}
