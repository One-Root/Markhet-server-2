import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketPrice } from '@one-root/markhet-core';

import { MarketPriceService } from './market-price.service';
import { MarketPriceController } from './market-price.controller';

import { CropModule } from '../crop/crop.module';
import { MarketModule } from '../market/market.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketPrice]),

    CropModule,
    MarketModule,
    SessionModule,
  ],
  providers: [MarketPriceService],
  controllers: [MarketPriceController],
  exports: [MarketPriceService],
})
export class MarketPriceModule {}
