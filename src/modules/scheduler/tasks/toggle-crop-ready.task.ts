import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { addDays } from 'date-fns';

import { CropService } from '../../crop/crop.service';
import { CropCardService } from '../../crop-card/crop-card.service';
import { CropName } from '../../../common/enums/farm.enum';
import { BulkUpdate } from '../../../common/interfaces/scheduler.interface';
import { HarvestHistoryService } from 'src/modules/harvest-history/harvest-history.service';
import { UserService } from 'src/modules/user/user.service';
import { HarvestStatus } from '../../../common/enums/harvest-history.enum';
import { ChatraceService } from 'src/modules/notification/chatrace/chatrace.service';
import {
  DryCoconut,
  TenderCoconut,
  Sunflower,
  Maize,
} from '@one-root/markhet-core/dist';
import { CropReportedByEnum, CropStatusEnum } from 'src/common/enums/crop.enum';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class ToggleCropReadyTask {
  private readonly logger = new Logger(ToggleCropReadyTask.name);
  private readonly BATCH_SIZE = 500;

  constructor(
    private readonly cropService: CropService,
    private readonly cropCardService: CropCardService,
    private readonly harvestHistoryService: HarvestHistoryService,
    private readonly userService: UserService,
    private readonly chatraceService: ChatraceService,
  ) {}

  @Cron('50 23 * * *')
  async toggleReadyToHarvest() {
    this.logger.log('Starting toggle crop ready process...');

    const cropNames = [
      CropName.TENDER_COCONUT,
      CropName.DRY_COCONUT,
      CropName.MAIZE,
      CropName.SUNFLOWER,
    ];

    const cropDisplayNames = {
      [CropName.TENDER_COCONUT]: 'ಯಾಲ್ನೀರು',
      [CropName.DRY_COCONUT]: 'ತೆಂಗಿನ ಕಾಯಿ',
      [CropName.MAIZE]: 'ಮಕ್ಕಿ',
      [CropName.SUNFLOWER]: 'ಸೂರ್ಯಕಾಂತಿ',
    };

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
          isReadyToHarvest: false,
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

          if (crop.isReadyToHarvest === true) {
            this.logger.log(
              `Skipping crop ${crop.id} - already Ready to Harvest`,
            );
            continue;
          }

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
            // Base message payload
            const messagePayload: any = {
              number: crop.farm.user.mobileNumber,
              name: crop.farm.user.name,
              NHD: String(crop.nextHarvestDate),
              cropName: cropDisplayNames[cropName],
              flowId: 1753170223469,
            };

            // Add noOfTrees only for coconut crops
            if (
              cropName === CropName.TENDER_COCONUT ||
              cropName === CropName.DRY_COCONUT
            ) {
              messagePayload.noOfTrees = crop.numberOfTrees;
            }

            await this.chatraceService.sendRTHMessage(messagePayload);
          } catch (error) {
            this.logger.error(
              `Failed to send RTH message for crop ${crop.id}: ${error.message}`,
            );
          }

          updates.push({
            id: crop.id,
            cropName,
            isReadyToHarvest: true,
            cropStatus: CropStatusEnum.MAYBE_READY,
            reportedBy: CropReportedByEnum.SYSTEM,
          });
        }

        await this.cropService.bulkUpdate(updates);

        this.logger.log(
          `Marked ${updates.length} crops as ready (crop name: ${cropName}).`,
        );

        // Create crop cards for crops that were just marked as ready
        await this.createCropCardsForUpdatedCrops(crops, cropName);

        page++;
      }
    }

    this.logger.log('Toggle crop ready process completed.');
  }

  /**
   * Creates crop cards for crops that were marked as ready to harvest
   */
  private async createCropCardsForUpdatedCrops(
    crops: (TenderCoconut | DryCoconut | Sunflower | Maize)[],
    cropName: CropName,
  ): Promise<void> {
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const crop of crops) {
      try {
        const farmerId = crop.farm?.user?.id;
        
        if (!farmerId) {
          this.logger.warn(
            `Cannot create crop card for crop ${crop.id}: farmer ID not found`,
          );
          skipCount++;
          continue;
        }

        await this.cropCardService.createCropCard(
          farmerId,
          crop.id,
          cropName,
        );
        
        successCount++;
        this.logger.debug(
          `Crop card created for crop ${crop.id} (${cropName})`,
        );
      } catch (error) {
        if (error instanceof BadRequestException) {
          // Crop card already exists - this is expected
          this.logger.debug(
            `Crop card already exists for crop ${crop.id}: ${error.message}`,
          );
          skipCount++;
        } else {
          // Unexpected error
          this.logger.error(
            `Failed to create crop card for crop ${crop.id}: ${error.message}`,
            error.stack,
          );
          errorCount++;
        }
      }
    }

    if (successCount > 0 || skipCount > 0 || errorCount > 0) {
      this.logger.log(
        `Crop card creation summary for ${cropName}: ${successCount} created, ${skipCount} skipped, ${errorCount} errors`,
      );
    }
  }
}
