import {
  Req,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Controller,
} from '@nestjs/common';

import { NotificationTemplate } from '@one-root/markhet-core';

import { NotificationTemplateService } from './notification-template.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto';

import { CustomRequest } from '../../common/interfaces/express.interface';
import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('notification-templates')
@UseGuards(JwtAuthGuard, SessionGuard)
export class NotificationTemplateController {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
  ) {}

  @Get(':id')
  async getRenderedNotificationTemplate(
    @Param('id') id: string,
    @Query() data: Record<string, any>,
  ): Promise<ApiResponse<NotificationTemplate>> {
    const notificationTemplate = await this.notificationTemplateService.findOne(
      id,
      data,
    );

    return new ApiResponse(
      HttpStatus.OK,
      'notification template retrieved successfully',
      notificationTemplate,
    );
  }

  @Post()
  async createNotificationTemplate(
    @Req() request: CustomRequest,
    @Body() createNotificationTemplateDto: CreateNotificationTemplateDto,
  ): Promise<ApiResponse<NotificationTemplate>> {
    const notificationTemplate = await this.notificationTemplateService.create(
      request.user,
      createNotificationTemplateDto,
    );

    return new ApiResponse(
      HttpStatus.CREATED,
      'notification template created successfully',
      notificationTemplate,
    );
  }
}
