import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Call } from '@one-root/markhet-core';

import { CallService } from './call.service';
import { CallController } from './call.controller';

import { UserModule } from '../user/user.module';
import { CropModule } from '../crop/crop.module';
import { EventModule } from '../event/event.module';
import { TicketModule } from '../ticket/ticket.module';
import { SessionModule } from '../session/session.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Call]),

    UserModule,
    CropModule,
    EventModule,
    TicketModule,
    SessionModule,
    NotificationModule,
  ],
  controllers: [CallController],
  providers: [CallService],
})
export class CallModule {}
