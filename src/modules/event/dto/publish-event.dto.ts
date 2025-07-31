import { IsEnum, IsString, IsObject } from 'class-validator';

import { EventQueue } from '../../../common/enums/event.enum';

export class PublishEventDto {
  @IsEnum(EventQueue)
  queue: EventQueue;

  @IsString()
  type: string;

  @IsObject()
  data: Record<string, any>;
}
