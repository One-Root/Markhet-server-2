import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { EventController } from './event.controller';
import { EventPublisher } from './publisher/event.publisher';

import { EventConsumer } from './consumer/event.consumer';

import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';
import { NotificationModule } from '../notification/notification.module';

import { EventQueue } from '../../common/enums/event.enum';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: EventQueue.DEFAULT,
      },
      { name: EventQueue.NOTIFICATION },
    ),

    UserModule,
    SessionModule,
    NotificationModule,
  ],
  controllers: [EventController],
  providers: [EventPublisher, EventConsumer],
  exports: [EventPublisher],
})
export class EventModule {}
