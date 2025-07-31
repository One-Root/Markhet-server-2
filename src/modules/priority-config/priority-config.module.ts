import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { PriorityConfig } from '@one-root/markhet-core';

import { PriorityConfigService } from './priority-config.service';
import { PriorityConfigController } from './priority-config.controller';

import { SessionModule } from '../session/session.module';

@Module({
  imports: [TypeOrmModule.forFeature([PriorityConfig]), SessionModule],
  providers: [PriorityConfigService],
  controllers: [PriorityConfigController],
  exports: [PriorityConfigService],
})
export class PriorityConfigModule {}
