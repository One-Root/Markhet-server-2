import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NewLocation } from '@one-root/markhet-core';

import { NewLocationController } from './newlocation.controller';
import { NewLocationService } from './newlocation.service';

@Module({
  imports: [TypeOrmModule.forFeature([NewLocation]), HttpModule],
  controllers: [NewLocationController],
  providers: [NewLocationService],
  exports: [NewLocationService],
})
export class NewLocationModule {}
