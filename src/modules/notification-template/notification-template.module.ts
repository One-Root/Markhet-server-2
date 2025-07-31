import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationTemplate } from '@one-root/markhet-core';

import { NotificationTemplateService } from './notification-template.service';
import { NotificationTemplateController } from './notification-template.controller';

import { SessionModule } from '../session/session.module';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationTemplate]), SessionModule],
  controllers: [NotificationTemplateController],
  providers: [NotificationTemplateService],
  exports: [NotificationTemplateService],
})
export class NotificationTemplateModule {}
