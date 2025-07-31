import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { addDays } from 'date-fns';

import { CropService } from '../../crop/crop.service';
import { CropName } from '../../../common/enums/farm.enum';
import { ChatraceService } from 'src/modules/notification/chatrace/chatrace.service';
import { TenderCoconut } from '@one-root/markhet-core/dist';

@Injectable()
export class sendPreRTHMessagesTask {
  private readonly logger = new Logger(sendPreRTHMessagesTask.name);
  private readonly BATCH_SIZE = 500;

  constructor(
    private readonly cropService: CropService,
    private readonly chatraceService: ChatraceService,
  ) {}

  @Cron('30 0 * * *')
  async sendPreRTHMessagesTask() {
    this.logger.log('Starting PreRTH Messaging process...');

    const cropNames = [CropName.TENDER_COCONUT];

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
          nextHarvestDate: addDays(new Date(), 4),
        })) as TenderCoconut[];

        if (crops.length === 0) {
          this.logger.log(
            `No more crops to process for crop name: ${cropName}`,
          );
          break;
        }

        for (const crop of crops) {
          this.logger.log(`Processing crop ID: ${crop.id}`);
          try {
            await this.chatraceService.sendRTHMessage({
              number: crop.farm.user.mobileNumber,
              name: crop.farm.user.name,
              NHD: String(crop.nextHarvestDate),
              cropName: 'ಯಾಲ್ನೀರು',
              noOfTrees: crop.numberOfTrees,
              flowId: 1752908292517,
            });
          } catch (err) {
            this.logger.warn(
              `Failed to send message to ${crop.farm.user.mobileNumber} for crop ID ${crop.id}: ${err.message}`,
            );
          }
        }

        this.logger.log(
          `${crops.length} messages sent for crop name: ${cropName}`,
        );

        page++;
      }
    }

    this.logger.log('PreRTH Message process completed.');
  }
}
