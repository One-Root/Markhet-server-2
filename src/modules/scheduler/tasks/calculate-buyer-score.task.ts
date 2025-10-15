import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { UserService } from '../../user/user.service';

import { Identity, UserPlanEnum } from '../../../common/enums/user.enum';
import { BulkUpdate } from '../../../common/interfaces/scheduler.interface';

@Injectable()
export class CalculateBuyerScoreTask {
  private readonly logger = new Logger(CalculateBuyerScoreTask.name);
  private readonly BATCH_SIZE = 500;

  constructor(private readonly userService: UserService) {}

  @Cron('0 */2 * * *') // Run every 2 hours
  async calculateBuyerScore() {
    this.logger.log('starting buyer score calculation.');

    let page = 1;

    while (true) {
      this.logger.log(
        `fetching buyers, page: ${page}, batch size: ${this.BATCH_SIZE}`,
      );

      const buyers = await this.userService.findAll({
        page,
        limit: this.BATCH_SIZE,
        identity: Identity.BUYER,
      });

      if (buyers.length === 0) {
        this.logger.log('no more buyers to process');
        break;
      }

      const updates: BulkUpdate[] = buyers.map((buyer) => {
        let score = 0;

        this.logger.log(`Buyer ID ${buyer.id} | Starting score calculation`);

        // Check if user has PREMIUM plan
        if (buyer.userPlan === UserPlanEnum.PREMIUM) {
          score += 40;
          this.logger.log(
            `Buyer ID ${buyer.id} | PREMIUM plan → +40 (score now: ${score})`,
          );
        }

        // Check if user was created within the last 7 days
        if (buyer.createdAt) {
          const now = new Date();
          const createdAt = new Date(buyer.createdAt);
          const daysDifference = Math.floor(
            (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysDifference <= 7) {
            score += 40;
            this.logger.log(
              `Buyer ID ${buyer.id} | Created ${daysDifference} day(s) ago → +40 (score now: ${score})`,
            );
          }
        }

        // Check if user was last active within the last 7 days
        if (buyer.lastActiveAt) {
          const now = new Date();
          const lastActiveAt = new Date(buyer.lastActiveAt);
          const daysDifference = Math.floor(
            (now.getTime() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysDifference <= 7) {
            score += 20;
            this.logger.log(
              `Buyer ID ${buyer.id} | Last active ${daysDifference} day(s) ago → +20 (score now: ${score})`,
            );
          }
        }

        // Cap at 100
        score = Math.min(score, 100);

        // Final summary log for this buyer
        this.logger.log(`Buyer ID ${buyer.id} | Final Score: ${score}`);

        return { id: buyer.id, score };
      });

      await this.userService.bulkUpdate(updates);

      this.logger.log(
        `processed and updated scores for ${buyers.length} buyers.`,
      );

      page++;
    }

    this.logger.log('buyer score calculation completed.');
  }
}

