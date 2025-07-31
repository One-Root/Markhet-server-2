import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Notification } from '@one-root/markhet-core';

import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

import { WhatsAppService } from './whatsapp/whatsapp.service';
import { PushNotificationService } from './push-notification/push-notification.service';

import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';
import { ChatraceService } from './chatrace/chatrace.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),

    HttpModule,

    UserModule,
    SessionModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    WhatsAppService,
    PushNotificationService,
    ChatraceService,
  ],
  exports: [
    NotificationService,
    WhatsAppService,
    PushNotificationService,
    ChatraceService,
  ],
})
export class NotificationModule {}
