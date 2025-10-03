import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PO } from '@one-root/markhet-core';

@Injectable()
export class DeactivatePoTask {
  private readonly logger = new Logger(DeactivatePoTask.name);

  constructor(
    @InjectRepository(PO)
    private readonly poRepository: Repository<PO>,
  ) {}

  // Run every day at 1:00 PM India Standard Time
  @Cron('0 13 * * *', { timeZone: 'Asia/Kolkata' })
  async deactivateActivePOsDaily() {
    this.logger.log('Starting daily PO deactivation (setting active=false)');

    try {
      const result = await this.poRepository.update({ isActive: true }, { isActive: false });
      const affected = (result as any)?.affected ?? 0;
      this.logger.log(`Deactivated ${affected} active POs.`);
    } catch (error) {
      this.logger.error('Failed to deactivate active POs', error?.stack || error);
    }
  }
}


