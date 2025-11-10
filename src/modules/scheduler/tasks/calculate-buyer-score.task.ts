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
    this.logger.log('Starting buyer score calculation.');

    let page = 1;
    let totalProcessed = 0;

    while (true) {
      this.logger.log(
        `Fetching buyers (page: ${page}, size: ${this.BATCH_SIZE})`,
      );

      const buyers = await this.userService.findAll({
        page,
        limit: this.BATCH_SIZE,
        identity: Identity.BUYER,
      });

      if (buyers.length === 0) {
        this.logger.log('No more buyers to process.');
        break;
      }

      const updates: BulkUpdate[] = buyers.map((buyer) => {
        let score = 0;

        // PREMIUM plan
        if (buyer.userPlan === UserPlanEnum.PREMIUM) {
          score += 60;
        }

        // Account created within last 7 days
        if (buyer.createdAt) {
          const daysSinceCreation =
            (Date.now() - new Date(buyer.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          if (daysSinceCreation <= 7) {
            score += 20;
          }
        }

        // Last active within last 7 days
        if (buyer.lastActiveAt) {
          const daysSinceActive =
            (Date.now() - new Date(buyer.lastActiveAt).getTime()) /
            (1000 * 60 * 60 * 24);
          if (daysSinceActive <= 7) {
            score += 10;
          }
        }

        // Cap at 100
        return { id: buyer.id, score: Math.min(score, 100) };
      });

      await this.userService.bulkUpdate(updates);
      totalProcessed += buyers.length;

      this.logger.log(
        `Updated scores for ${buyers.length} buyers (total processed: ${totalProcessed}).`,
      );

      page++;
    }

    this.logger.log(
      `Buyer score calculation completed. Total buyers processed: ${totalProcessed}.`,
    );
  }
}
