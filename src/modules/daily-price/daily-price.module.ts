import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DailyPrice } from '@one-root/markhet-core';

import { DailyPriceService } from './daily-price.service';
import { DailyPriceController } from './daily-price.controller';

import { UserModule } from '../user/user.module';
import { CropModule } from '../crop/crop.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyPrice]),

    UserModule,
    CropModule,
    SessionModule,
  ],
  controllers: [DailyPriceController],
  providers: [DailyPriceService],
})
export class DailyPriceModule {}
