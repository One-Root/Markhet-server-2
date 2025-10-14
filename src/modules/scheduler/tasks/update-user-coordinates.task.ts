import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { UserService } from '../../user/user.service';

@Injectable()
export class UpdateUserCoordinatesTask {
  private readonly logger = new Logger(UpdateUserCoordinatesTask.name);
  private readonly BATCH_SIZE = 100;
  private readonly API_DELAY_MS = 200; // Delay between API calls to avoid rate limits

  constructor(
    private readonly userService: UserService,
    private readonly httpService: HttpService,
  ) {}

  @Cron('0 2 * * *') 
  async updateUserCoordinates() {
    this.logger.log('Starting user coordinates update process...');

    const googleApiKey = process.env.GCP_GOOGLE_MAPS_API_KEY;
    if (!googleApiKey) {
      this.logger.error('GCP_GOOGLE_MAPS_API_KEY environment variable is not set');
      return;
    }

    let page = 1;
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    while (true) {
      this.logger.log(
        `Fetching users without coordinates, page: ${page}, batch size: ${this.BATCH_SIZE}`,
      );

      const users = await this.userService.findUsersWithoutCoordinates({
        page,
        limit: this.BATCH_SIZE,
      });

      this.logger.log(`Found ${users.length} users without coordinates`);
      this.logger.log(`Users: ${JSON.stringify(users)}`);

      if (users.length === 0) {
        this.logger.log('No more users to process');
        break;
      }

      this.logger.log(`Processing ${users.length} users...`);

      for (const user of users) {
        totalProcessed++;

        if (!user.village || !user.taluk || !user.district) {
          this.logger.log(
            `Skipping user ${user.id} (missing location info: village=${user.village}, taluk=${user.taluk}, district=${user.district})`,
          );
          totalSkipped++;
          continue;
        }

        try {
          const coordinates = await this.getCoordinates(
            user.village,
            user.taluk,
            user.district,
            googleApiKey,
          );

          if (coordinates) {
            await this.userService.updateUserCoordinates(user.id, coordinates);
            this.logger.log(
              `✅ Updated user ${user.id} → [${coordinates[0]}, ${coordinates[1]}]`,
            );
            totalUpdated++;
          } else {
            this.logger.warn(
              `No coordinates found for user ${user.id} (${user.village}, ${user.taluk}, ${user.district})`,
            );
            totalSkipped++;
          }
        } catch (error) {
          this.logger.error(
            `Error processing user ${user.id}: ${error.message}`,
          );
          totalErrors++;
        }

        // Add delay to avoid hitting API rate limits
        await new Promise((resolve) =>
          setTimeout(resolve, this.API_DELAY_MS),
        );
      }

      this.logger.log(
        `Processed batch ${page}: ${users.length} users (${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors)`,
      );

      page++;
    }

    this.logger.log(
      `🎯 User coordinates update completed. Total: ${totalProcessed} processed, ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`,
    );
  }

  private async getCoordinates(
    village: string,
    taluk: string,
    district: string,
    apiKey: string,
  ): Promise<[number, number] | null> {
    const address = `${village}, ${taluk}, ${district}, India`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${apiKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data;

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return [location.lng, location.lat]; // GeoJSON order: [lng, lat]
      } else {
        this.logger.warn(`No coordinates found for: ${address}`);
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Error fetching coordinates for ${address}: ${error.message}`,
      );
      return null;
    }
  }
}
