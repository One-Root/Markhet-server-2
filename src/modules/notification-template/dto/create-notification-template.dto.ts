import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

import { Language } from '../../../common/enums/user.enum';
import { NotificationChannel } from '../../../common/enums/notification.enum';

export class CreateNotificationTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsEnum(Language)
  language: Language;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;
}
