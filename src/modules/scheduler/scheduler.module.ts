import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { SchedulerService } from './scheduler.service';

import { UserModule } from '../user/user.module';
import { CropModule } from '../crop/crop.module';
import { EventModule } from '../event/event.module';
import { ReservationModule } from '../reservation/reservation.module';
import { PriorityConfigModule } from '../priority-config/priority-config.module';

import { ToggleCropReadyTask } from './tasks/toggle-crop-ready.task';
import { ReservationReminderTask } from './tasks/reservation-reminder.task';
import { CalculateEntityScoreTask } from './tasks/calculate-entity-score.task';
import { CalculateNextHarvestDateTask } from './tasks/calculate-next-harvest-date.task';
import { HarvestHistoryModule } from '../harvest-history/harvest-history.module';
import { sendPreRTHMessagesTask } from './tasks/send-preRTH-message.task';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HarvestHistoryModule,
    UserModule,
    CropModule,
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
  ],
  exports: [SchedulerService],
})
export class SchedulerModule {}
