import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ReservationService } from '../../reservation/reservation.service';
import { EventPublisher } from '../../event/publisher/event.publisher';

import { ReservationStatus } from '../../../common/enums/reservation.enum';
import {
  EventQueue,
  NotificationEvent,
} from '../../../common/enums/event.enum';
import { getLocalizedMessage } from '../../../common/utils/get-localized-message.util';

@Injectable()
export class ReservationReminderTask {
  private readonly logger = new Logger(ReservationReminderTask.name);

  constructor(
    private readonly reservationService: ReservationService,

    private readonly eventPublisher: EventPublisher,
  ) {}

  @Cron('5 0 * * *')
  async reservationReminder() {
    this.logger.log('starting reservation reminder.');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reservations =
      await this.reservationService.findReservationsByDateAndStatus(
        today,
        ReservationStatus.CONFIRMED,
      );

    if (reservations.length > 0) {
      this.logger.log(
        `found ${reservations.length} reservations scheduled for today.`,
      );

      for (const reservation of reservations) {
        const { crop, user } = reservation;

        const title = getLocalizedMessage(
          'reservation_reminder_title',
          user.language,
          {},
        );

        const body = getLocalizedMessage(
          'reservation_reminder_body',
          user.language,
          { cropName: crop.cropName },
        );

        // payload
        const payload = {
          queue: EventQueue.NOTIFICATION,
          type: NotificationEvent.PUSH,
          data: {
            data: {
              title,
              body,
              link: `${process.env.DOMAIN}/buyer?reservationId=${reservation.id}`,
            },
            userIds: [reservation.user.id],
            language: reservation.user.language,
          },
        };

        // options
        const options = { removeOnComplete: true, removeOnFail: true };

        await this.eventPublisher.publish(payload, options);
      }
    } else {
      this.logger.log('no reservations scheduled for today.');
    }

    this.logger.log('reservation reminder completed.');
  }
}
