import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Farm } from '@one-root/markhet-core';

import { FarmService } from './farm.service';
import { FarmController } from './farm.controller';

import { SessionModule } from '../session/session.module';

@Module({
  imports: [TypeOrmModule.forFeature([Farm]), SessionModule],
  controllers: [FarmController],
  providers: [FarmService],
  exports: [FarmService],
})
export class FarmModule {}
