import {
  IsUUID,
  IsEnum,
  IsArray,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

import { Language } from '../../../common/enums/user.enum';
import { NotificationChannel } from '../../../common/enums/notification.enum';

export class CreateBulkNotificationsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsArray()
  @IsUUID('all', { each: true })
  recipientIds: string[];

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsEnum(Language)
  language: Language;
}
