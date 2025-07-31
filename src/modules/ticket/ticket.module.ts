import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Ticket } from '@one-root/markhet-core';

import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';

import { SessionModule } from '../session/session.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), SessionModule],
  providers: [TicketService],
  exports: [TicketService],
  controllers: [TicketController],
})
export class TicketModule {}
