import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HarvestHistory } from '@one-root/markhet-core';

import { HarvestHistoryService } from './harvest-history.service';
import { HarvestHistoryController } from './harvest-history.controller';

import { CropModule } from '../crop/crop.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HarvestHistory]),
    CropModule,
    SessionModule,
  ],
  controllers: [HarvestHistoryController],
  providers: [HarvestHistoryService],
  exports: [HarvestHistoryService],
})
export class HarvestHistoryModule {}
