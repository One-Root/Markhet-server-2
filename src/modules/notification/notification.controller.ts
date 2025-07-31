import { Body, Patch, UseGuards, HttpStatus, Controller } from '@nestjs/common';

import { NotificationService } from './notification.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { MarkNotificationsAsReadDTO } from './dto/mark-notifications-as-read.dto';

import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('notifications')
@UseGuards(JwtAuthGuard, SessionGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Patch('mark-as-read')
  async markAsRead(
    @Body() markNotificationsAsReadDTO: MarkNotificationsAsReadDTO,
  ): Promise<ApiResponse<null>> {
    await this.notificationService.markNotificationsAsRead(
      markNotificationsAsReadDTO,
    );

    return new ApiResponse(
      HttpStatus.OK,
      'notifications marked as read successfully',
      null,
    );
  }
}
