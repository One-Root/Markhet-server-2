import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Crop,
  Banana,
  Turmeric,
  DryCoconut,
  TenderCoconut,
  Sunflower,
} from '@one-root/markhet-core';

import { CropService } from './crop.service';
import { CropController } from './crop.controller';

import { FarmModule } from '../farm/farm.module';
import { CacheModule } from '../cache/cache.module';
import { SessionModule } from '../session/session.module';
import { NotificationModule } from '../notification/notification.module';

import { CropEntitySubscriber } from './subscribers/crop.subscriber';
import { FileService } from '../file/file.service';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Crop,
      TenderCoconut,
      Turmeric,
      Banana,
      DryCoconut,
      Sunflower,
    ]),
    EventModule,
    FarmModule,
    CacheModule,
    SessionModule,
    NotificationModule,
  ],
  controllers: [CropController],
  providers: [CropService, CropEntitySubscriber, FileService],
  exports: [CropService, FileService],
})
export class CropModule {}
