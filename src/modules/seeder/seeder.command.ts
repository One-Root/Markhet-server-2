import { Logger, Injectable } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Injectable()
export class SeederCommand {
  private readonly logger = new Logger(SeederCommand.name);

  constructor(private readonly seederService: SeederService) {}

  async run(): Promise<void> {
    this.logger.log('starting seeding process...');

    try {
      this.logger.log('seeding locations...');
      await this.seederService.seedLocations();
      this.logger.log('locations seeding completed successfully!');
    } catch (error) {
      console.error('error during seeding : ', error.message || error);
    }

    this.logger.log('seeding process finished.');
  }
}
