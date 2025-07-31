import { Post, Body, UseGuards, HttpStatus, Controller } from '@nestjs/common';

import { Job } from 'bullmq';

import { PublishEventDto } from './dto/publish-event.dto';
import { EventPublisher } from './publisher/event.publisher';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('events')
@UseGuards(JwtAuthGuard, SessionGuard)
export class EventController {
  constructor(private readonly eventPublisher: EventPublisher) {}

  @Post('publish')
  async publish(
    @Body() publishEventDto: PublishEventDto,
  ): Promise<ApiResponse<Job<any, any, string>>> {
    const event = await this.eventPublisher.publish(publishEventDto, {});

    return new ApiResponse(
      HttpStatus.CREATED,
      'event published successfully',
      event,
    );
  }
}
