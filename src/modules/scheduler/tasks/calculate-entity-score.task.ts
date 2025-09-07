import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PriorityConfig } from '@one-root/markhet-core';

import { CropService } from '../../crop/crop.service';
import { UserService } from '../../user/user.service';
import { PriorityConfigService } from '../../priority-config/priority-config.service';

import { CropName } from '../../../common/enums/farm.enum';
import {
  ConfigEntity,
  ConfigRelation,
} from '../../../common/enums/priority-config.enum';
import { BulkUpdate } from '../../../common/interfaces/scheduler.interface';
import { CropReportedByEnum, CropStatusEnum } from 'src/common/enums/crop.enum';
import { log } from 'console';
import { th } from 'date-fns/locale';

@Injectable()
export class CalculateEntityScoreTask {
  private readonly logger = new Logger(CalculateEntityScoreTask.name);
  private readonly BATCH_SIZE = 500;

  constructor(
    private readonly cropService: CropService,
    private readonly userService: UserService,
    private readonly priorityConfigService: PriorityConfigService,
  ) {}

  @Cron('0 * * * *')
  async calculateScore() {
    this.logger.log('starting score calculation.');

    const configs = await this.priorityConfigService.find([
      ConfigRelation.USER,
      ConfigRelation.CROP,
      ConfigRelation.CROP_FARM,
      ConfigRelation.CROP_FARM_USER,
    ]);

    let page = 1;

    for (const { entity } of configs) {
      switch (entity) {
        case ConfigEntity.USER:
          await this.processUsers(configs);
          break;

        case ConfigEntity.CROP:
          await this.processCrops(configs);
          break;

        default:
          this.logger.warn(`invalid entity '${entity}'.`);
          break;
      }

      page++;
    }

    this.logger.log('score calculation completed.');
  }

  async processUsers(configs: PriorityConfig[]) {
    let page = 1;

    while (true) {
      const users = await this.userService.findAll({
        page,
        limit: this.BATCH_SIZE,
      });

      if (users.length === 0) {
        this.logger.log('no more users to process');
        break;
      }

      const updates: BulkUpdate[] = users.map((user) => {
        const score = this.priorityConfigService.calculateScore(user, configs);
        return { id: user.id, score };
      });

      await this.userService.bulkUpdate(updates);

      this.logger.log(
        `processed and updated scores for ${users.length} users.`,
      );

      page++;
    }
  }

  async processCrops(configs: PriorityConfig[]) {
    const cropNames = Object.values(CropName);

    for (const cropName of cropNames) {
      this.logger.log(`processing crops for crop name : ${cropName}`);

      let page = 1;

      while (true) {
        this.logger.log(
          `fetching crops for crop name: ${cropName}, page: ${page}, batch size: ${this.BATCH_SIZE}`,
        );

        const crops = await this.cropService.findAll({
          cropName,
          page,
          limit: this.BATCH_SIZE,
        });

        if (crops.length === 0) {
          this.logger.log(
            `no more crops to process for crop name: ${cropName}`,
          );
          break;
        }

        const updates: BulkUpdate[] = crops.map((crop) => {
          let score = this.priorityConfigService.calculateScore(crop, configs);

          if (crop.cropStatus === CropStatusEnum.PAKKA_READY) {
            score += 30;
          } else if (crop.cropStatus === CropStatusEnum.FARMER_REPORTED) {
            score += 20;
          } else if (crop.cropStatus === CropStatusEnum.MAYBE_READY) {
            if (crop.reportedBy === CropReportedByEnum.SUPPORT) {
              score += 15;
            } else {
              score += 10;
            }
          }

          score = Math.min(score, 100);

          let isPremium = false;
          if (
            cropName === CropName.TENDER_COCONUT &&
            crop.isReadyToHarvest &&
            crop.isVerified &&
            crop.quantity > 500
          ) {
            isPremium = true;
          }

          return { id: crop.id, score, cropName, isPremium };
        });

        await this.cropService.bulkUpdate(updates);

        this.logger.log(
          `processed and updated scores for ${crops.length} crops (crop name: ${cropName}).`,
        );

        page++;
      }
    }
  }
}
