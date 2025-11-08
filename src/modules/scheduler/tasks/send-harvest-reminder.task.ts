import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { CropService } from '../../crop/crop.service';
import { CropName } from '../../../common/enums/farm.enum';
import {
  TenderCoconut,
  DryCoconut,
  Sunflower,
  Maize,
  Banana,
  Turmeric,
} from '@one-root/markhet-core/dist';

@Injectable()
export class SendHarvestReminderTask {
  private readonly logger = new Logger(SendHarvestReminderTask.name);
  private readonly BATCH_SIZE = 500;
  private readonly chatraceAPIKey: string;

  constructor(private readonly cropService: CropService) {
    this.chatraceAPIKey = process.env.CHATRACE_API_KEY;
  }

  // Runs daily at 7:00 AM IST (1:30 AM UTC)
  @Cron('30 1 * * *')
  async sendHarvestReminders() {
    this.logger.log('Starting harvest reminder task at 7 AM IST...');

    if (!this.chatraceAPIKey) {
      this.logger.error('CHATRACE_API_KEY not configured');
      return;
    }

    const cropNames = [
      CropName.TENDER_COCONUT,
      CropName.DRY_COCONUT,
      CropName.MAIZE,
      CropName.SUNFLOWER,
      CropName.BANANA,
      CropName.TURMERIC,
    ];

    const cropDisplayNames = {
      [CropName.TENDER_COCONUT]: 'ಯಾಲ್ನೀರು',
      [CropName.DRY_COCONUT]: 'ತೆಂಗಿನ ಕಾಯಿ',
      [CropName.MAIZE]: 'ಮಕ್ಕಿ',
      [CropName.SUNFLOWER]: 'ಸೂರ್ಯಕಾಂತಿ',
      [CropName.BANANA]: 'ಬಾಳೆಹಣ್ಣು',
      [CropName.TURMERIC]: 'ಅರಿಶಿನ',
    };

    let totalMessagesSent = 0;
    let totalErrors = 0;

    for (const cropName of cropNames) {
      this.logger.log(`Processing ${cropName}...`);

      let page = 1;

      while (true) {
        let crops;
        try {
          crops = (await this.cropService.findAll({
            cropName,
            page,
            limit: this.BATCH_SIZE,
            isReadyToHarvest: 'true' as any,
          })) as (
            | TenderCoconut
            | DryCoconut
            | Sunflower
            | Maize
            | Banana
            | Turmeric
          )[];
        } catch (error) {
          this.logger.error(
            `Error fetching crops for ${cropName}: ${error.message}`,
          );
          break;
        }

        if (crops.length === 0) {
          break;
        }

        for (const crop of crops) {
          try {
            if (!crop.farm || !crop.farm.user) {
              this.logger.warn(
                `Skipping crop ${crop.id}: missing farm or user`,
              );
              continue;
            }

            const phone = crop.farm.user.mobileNumber;
            const sanitizedPhone = phone.startsWith('+91')
              ? phone
              : `+91${phone}`;

            const cropId = crop.id.substring(0, 8);
            const cropExpectedPrice =
              crop.price !== undefined && crop.price !== null
                ? String(crop.price)
                : 'NA';

            const farmerName = crop.farm.user.name
              ? String(crop.farm.user.name)
              : 'NA';
            const farmerVillage = crop.farm.village
              ? String(crop.farm.village)
              : 'NA';
            const farmerTaluk = crop.farm.taluk
              ? String(crop.farm.taluk)
              : 'NA';
            const farmerDistrict = crop.farm.district
              ? String(crop.farm.district)
              : 'NA';

            const payload = {
              phone: sanitizedPhone,
              first_name: farmerName,
              last_name: 'farmer',
              gender: 'male',
              actions: [
                {
                  action: 'set_field_value',
                  field_name: 'farmer_name',
                  value: farmerName,
                },
                {
                  action: 'set_field_value',
                  field_name: 'Crop_Name',
                  value: cropDisplayNames[cropName] || cropName,
                },
                {
                  action: 'set_field_value',
                  field_name: 'crop_id',
                  value: cropId,
                },
                {
                  action: 'set_field_value',
                  field_name: 'crop_expected_price',
                  value: cropExpectedPrice,
                },
                {
                  action: 'set_field_value',
                  field_name: 'farmer_village',
                  value: farmerVillage,
                },
                {
                  action: 'set_field_value',
                  field_name: 'farmer_taluk',
                  value: farmerTaluk,
                },
                {
                  action: 'set_field_value',
                  field_name: 'farmer_district',
                  value: farmerDistrict,
                },
                {
                  action: 'set_field_value',
                  field_name: 'farmer_phone',
                  value: sanitizedPhone,
                },
                {
                  action: 'send_flow',
                  flow_id: 1762598945967,
                },
              ],
            };

            const resp = await fetch('https://api.chatrace.com/users', {
              method: 'POST',
              headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-ACCESS-TOKEN': this.chatraceAPIKey,
              },
              body: JSON.stringify(payload),
            });

            if (!resp.ok) {
              const errorText = await resp.text();
              this.logger.error(
                `API error for crop ${crop.id}: ${errorText}`,
              );
              totalErrors++;
            } else {
              totalMessagesSent++;
            }
          } catch (error) {
            totalErrors++;
            this.logger.error(
              `Failed to send message for crop ${crop.id}: ${error.message}`,
            );
          }
        }

        page++;
      }
    }

    this.logger.log(
      `Harvest reminders completed. Sent: ${totalMessagesSent}, Errors: ${totalErrors}`,
    );
  }
}

