import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';

import { TicketType, TicketStatus } from '../../../common/enums/ticket.enum';

export class CreateTicketDto {
  @IsEnum(TicketType)
  type: TicketType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
