import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Reservation } from '@one-root/markhet-core';

import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

import { CropModule } from '../crop/crop.module';
import { EventModule } from '../event/event.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),

    CropModule,
    EventModule,
    SessionModule,
  ],
  providers: [ReservationService],
  controllers: [ReservationController],
  exports: [ReservationService],
})
export class ReservationModule {}
