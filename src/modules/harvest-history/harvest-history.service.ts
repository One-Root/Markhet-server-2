import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User, HarvestHistory } from '@one-root/markhet-core';

import { CropService } from '../crop/crop.service';

import { CreateHarvestHistoryDto } from './dto/create-harvest-history.dto';

@Injectable()
export class HarvestHistoryService {
  constructor(
    @InjectRepository(HarvestHistory)
    private readonly harvestHistoryRepository: Repository<HarvestHistory>,

    private readonly cropService: CropService,
  ) {}

  async create(
    user: User,
    createHarvestHistoryDto: CreateHarvestHistoryDto,
  ): Promise<HarvestHistory> {
    const { cropId, cropName, status } = createHarvestHistoryDto;

    const crop = await this.cropService.findOne(cropName, cropId);

    // payload
    const payload = {
      crop,
      status,
      creator: user,
      snapshot: crop,
    };

    const history = this.harvestHistoryRepository.create(payload);

    return this.harvestHistoryRepository.save(history);
  }
}
