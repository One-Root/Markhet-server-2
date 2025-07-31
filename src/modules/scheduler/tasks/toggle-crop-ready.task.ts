import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { addDays } from 'date-fns';

import { CropService } from '../../crop/crop.service';
import { CropName } from '../../../common/enums/farm.enum';
import { BulkUpdate } from '../../../common/interfaces/scheduler.interface';
import { HarvestHistoryService } from 'src/modules/harvest-history/harvest-history.service';
import { UserService } from 'src/modules/user/user.service';
import { HarvestStatus } from '../../../common/enums/harvest-history.enum';
import { ChatraceService } from 'src/modules/notification/chatrace/chatrace.service';
import { DryCoconut, TenderCoconut } from '@one-root/markhet-core/dist';

@Injectable()
export class ToggleCropReadyTask {
  private readonly logger = new Logger(ToggleCropReadyTask.name);
  private readonly BATCH_SIZE = 500;

  constructor(
    private readonly cropService: CropService,
    private readonly harvestHistoryService: HarvestHistoryService,
    private readonly userService: UserService,
    private readonly chatraceService: ChatraceService,
  ) {}

  @Cron('50 23 * * *')
  async toggleReadyToHarvest() {
    this.logger.log('Starting toggle crop ready process...');

    const cropNames = [CropName.TENDER_COCONUT, CropName.DRY_COCONUT];
    const user = await this.userService.findByMobileNumber('+919458001001');
    const today = new Date();

    for (const cropName of cropNames) {
      this.logger.log(`Processing crops for crop name: ${cropName}`);

      let page = 1;
      while (true) {
        this.logger.log(
          `Fetching crops for crop name: ${cropName}, page: ${page}, batch size: ${this.BATCH_SIZE}`,
        );

        const crops = (await this.cropService.findAll({
          cropName,
          page,
          limit: this.BATCH_SIZE,
          nextHarvestDate: today,
        })) as TenderCoconut[] | DryCoconut[];

        if (crops.length === 0) {
          this.logger.log(
            `No more crops to process for crop name: ${cropName}`,
          );
          break;
        }

        const updates: BulkUpdate[] = [];

        for (const crop of crops) {
          this.logger.log(`Processing crop ID: ${crop.id}`);

          try {
            await this.harvestHistoryService.create(user, {
              cropId: crop.id,
              cropName,
              status: HarvestStatus.ON,
            });
          } catch (error) {
            this.logger.error(
              `Failed to log harvest history for crop ${crop.id}: ${error.message}`,
            );
          }

          try {
            await this.chatraceService.sendRTHMessage({
              number: crop.farm.user.mobileNumber,
              name: crop.farm.user.name,
              NHD: String(crop.nextHarvestDate),
              cropName:
                cropName === CropName.TENDER_COCONUT
                  ? 'ಯಾಲ್ನೀರು'
                  : 'ತೆಂಗಿನ ಕಾಯಿ',
              noOfTrees: crop.numberOfTrees,
              flowId: 1753170223469,
            });
          } catch (error) {
            this.logger.error(
              `Failed to send RTH message for crop ${crop.id}: ${error.message}`,
            );
          }

          updates.push({
            id: crop.id,
            cropName,
            isReadyToHarvest: true,
          });
        }

        await this.cropService.bulkUpdate(updates);

        this.logger.log(
          `Marked ${updates.length} crops as ready (crop name: ${cropName}).`,
        );

        page++;
      }
    }

    this.logger.log('Toggle crop ready process completed.');
  }
}
