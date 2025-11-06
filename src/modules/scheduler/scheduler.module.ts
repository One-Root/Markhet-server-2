import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

import { SchedulerService } from './scheduler.service';

import { UserModule } from '../user/user.module';
import { CropModule } from '../crop/crop.module';
import { CropCardModule } from '../crop-card/crop-card.module';
import { EventModule } from '../event/event.module';
import { ReservationModule } from '../reservation/reservation.module';
import { PriorityConfigModule } from '../priority-config/priority-config.module';

import { ToggleCropReadyTask } from './tasks/toggle-crop-ready.task';
import { ReservationReminderTask } from './tasks/reservation-reminder.task';
import { CalculateEntityScoreTask } from './tasks/calculate-entity-score.task';
import { CalculateNextHarvestDateTask } from './tasks/calculate-next-harvest-date.task';
import { CalculateBuyerScoreTask } from './tasks/calculate-buyer-score.task';
import { HarvestHistoryModule } from '../harvest-history/harvest-history.module';
import { sendPreRTHMessagesTask } from './tasks/send-preRTH-message.task';
import { NotificationModule } from '../notification/notification.module';
import { UpdateUserCoordinatesTask } from './tasks/update-user-coordinates.task';
import { ManagePOExpiryTask } from './tasks/manage-po-expiry.task';
import { PO, POInterest } from '@one-root/markhet-core';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([PO, POInterest]),
    HttpModule,
    HarvestHistoryModule,
    UserModule,
    CropModule,
    CropCardModule,
    EventModule,
    ReservationModule,
    PriorityConfigModule,
    NotificationModule,
  ],
  providers: [
    SchedulerService,
    sendPreRTHMessagesTask,
    ToggleCropReadyTask,
    ReservationReminderTask,
    CalculateEntityScoreTask,
    CalculateNextHarvestDateTask,
    CalculateBuyerScoreTask,
    UpdateUserCoordinatesTask,
    ManagePOExpiryTask,
  ],
  exports: [SchedulerService],
})
export class SchedulerModule {}
