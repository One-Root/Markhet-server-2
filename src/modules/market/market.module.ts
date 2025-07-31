import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Market } from '@one-root/markhet-core';

import { MarketService } from './market.service';
import { MarketController } from './market.controller';

import { SessionModule } from '../session/session.module';

@Module({
  imports: [TypeOrmModule.forFeature([Market]), SessionModule],
  providers: [MarketService],
  controllers: [MarketController],
  exports: [MarketService],
})
export class MarketModule {}
