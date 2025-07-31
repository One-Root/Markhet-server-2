import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User, Ticket } from '@one-root/markhet-core';

import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async create(user: User, createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      user,
    });

    return this.ticketRepository.save(ticket);
  }
}
