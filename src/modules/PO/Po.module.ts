import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PO, POInterest, User } from '@one-root/markhet-core';
import { PoController } from './Po.controller';
import { PoService } from './po.service';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [TypeOrmModule.forFeature([PO, POInterest, User]), SessionModule],
  providers: [PoService],
  controllers: [PoController],
  exports: [],
})
export class PoModule {}
