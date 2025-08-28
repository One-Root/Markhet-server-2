import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { addDays } from 'date-fns';

import { CropService } from '../../crop/crop.service';

import { CropName } from '../../../common/enums/farm.enum';
import { BulkUpdate } from '../../../common/interfaces/scheduler.interface';
import { UserService } from 'src/modules/user/user.service';
import { HarvestHistoryService } from 'src/modules/harvest-history/harvest-history.service';
import { HarvestStatus } from 'src/common/enums/harvest-history.enum';
import { CropReportedByEnum, CropStatusEnum } from 'src/common/enums/crop.enum';

@Injectable()
export class CalculateNextHarvestDateTask {
  private readonly logger = new Logger(CalculateNextHarvestDateTask.name);
  private readonly BATCH_SIZE = 500;

  constructor(
    private readonly cropService: CropService,
    private readonly userService: UserService,
    private readonly harvestHistoryService: HarvestHistoryService,
  ) {}

  @Cron('50 23 * * *')
  async calculateNextHarvestDate() {
    this.logger.log('starting next harvest date calculation.');

    const cropNames = [CropName.TENDER_COCONUT, CropName.DRY_COCONUT];
    const user = await this.userService.findByMobileNumber('+919458001001');

    for (const cropName of cropNames) {
      this.logger.log(`processing crops for crop name: ${cropName}`);

      let page = 1;

      while (true) {
        this.logger.log(
          `fetching crops for crop name: ${cropName}, page: ${page}, batch size: ${this.BATCH_SIZE}`,
        );

        const today = new Date();
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(today.getDate() - 5);

        const crops = await this.cropService.findAll({
          cropName,
          page,
          limit: this.BATCH_SIZE,
          nextHarvestDate: fiveDaysAgo,
        });

        if (crops.length === 0) {
          this.logger.log(
            `no more crops to process for crop name: ${cropName}`,
          );
          break;
        }

        const updates: BulkUpdate[] = crops.map((crop) => {
          let nextHarvestDate: Date;

          const { id, generalHarvestCycleInDays } = crop;

          if (generalHarvestCycleInDays) {
            nextHarvestDate = addDays(today, generalHarvestCycleInDays);
          } else if (cropName === CropName.TENDER_COCONUT) {
            nextHarvestDate = addDays(today, 35);
          } else if (cropName === CropName.DRY_COCONUT) {
            nextHarvestDate = addDays(today, 45);
          }

          return {
            id,
            cropName,
            nextHarvestDate,
            lastHarvestDate: crop.nextHarvestDate,
            isReadyToHarvest: false,
            cropStatus: CropStatusEnum.NOT_READY,
            reportedBy: CropReportedByEnum.SYSTEM,
          };
        });

        await this.cropService.bulkUpdate(updates);

        this.logger.log(
          `processed and updated next harvest dates for ${crops.length} crops (crop name: ${cropName}).`,
        );

        for (const crop of crops) {
          try {
            await this.harvestHistoryService.create(user, {
              cropId: crop.id,
              cropName,
              status: HarvestStatus.OFF,
            });
          } catch (error) {
            this.logger.error(
              `Failed to log harvest history for crop ${crop.id}: ${error.message}`,
            );
          }
        }

        page++;
      }
    }

    this.logger.log('next harvest date calculation completed.');
  }
}
