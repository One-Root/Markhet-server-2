import { IsUUID, IsArray } from 'class-validator';

export class MarkNotificationsAsReadDTO {
  @IsArray()
  @IsUUID('all', { each: true })
  notificationIds: string[];
}
