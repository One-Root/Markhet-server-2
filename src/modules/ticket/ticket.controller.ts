import { UseGuards, Controller } from '@nestjs/common';

import { TicketService } from './ticket.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard, SessionGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}
}
