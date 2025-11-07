import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { PO, POInterest } from '@one-root/markhet-core';
import { Repository } from 'typeorm';

@Injectable()
export class ManagePOExpiryTask {
  private readonly logger = new Logger(ManagePOExpiryTask.name);

  constructor(
    @InjectRepository(PO)
    private readonly pORepository: Repository<PO>,
    @InjectRepository(POInterest)
    private readonly poInterestRepository: Repository<POInterest>,
  ) {}

  @Cron('0 22 * * *')
  async managePOExpiry() {
    this.logger.log('Starting manage PO expiry process...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all active POs
      const activePOs = await this.pORepository.find({
        where: {
          isActive: true,
        },
      });

      if (activePOs.length === 0) {
        this.logger.log('No active POs found.');
        return;
      }

      this.logger.log(`Found ${activePOs.length} active POs to process.`);

      let expiredCount = 0;
      let priceResetCount = 0;

      for (const po of activePOs) {
        const expiryDate = new Date(po.expiresAt);
        expiryDate.setHours(0, 0, 0, 0);

        // Delete all interests for this PO from the database
        try {
          await this.poInterestRepository.delete({ po: { id: po.id } });
          this.logger.log(`Deleted all interests for PO with id: ${po.id}`);
        } catch (error) {
          this.logger.error(
            `Failed to delete interests for PO ${po.id}: ${error.message}`,
          );
        }

        if (expiryDate.getTime() <= today.getTime()) {
          po.isActive = false;
          await this.pORepository.save(po);
          expiredCount++;
          this.logger.log(`Deactivated expired PO with id: ${po.id}`);
        }
        // If not expired, reset price to 0
        else if (expiryDate.getTime() > today.getTime()) {
          po.price_rate = 0;
          await this.pORepository.save(po);
          priceResetCount++;
          this.logger.debug(`Reset price to 0 for PO with id: ${po.id}`);
        }
      }

      this.logger.log(
        `Manage PO expiry process completed. ${expiredCount} POs deactivated, ${priceResetCount} POs price reset.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to manage PO expiry: ${error.message}`,
        error.stack,
      );
    }
  }
}
