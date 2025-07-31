import {
  Inject,
  Logger,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';

import { Job, JobsOptions, Queue } from 'bullmq';

import { PublishEventDto } from '../dto/publish-event.dto';

import {
  EventQueue,
  DefaultEvent,
  NotificationEvent,
} from '../../../common/enums/event.enum';

@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);

  private readonly queues: Record<EventQueue, Queue>;

  constructor(
    @Inject(getQueueToken(EventQueue.DEFAULT))
    private readonly defaultQueue: Queue,

    @Inject(getQueueToken(EventQueue.NOTIFICATION))
    private readonly notificationQueue: Queue,
  ) {
    this.queues = {
      [EventQueue.DEFAULT]: this.defaultQueue,
      [EventQueue.NOTIFICATION]: this.notificationQueue,
    };
  }

  async publish(
    publishEventDto: PublishEventDto,
    options: JobsOptions,
  ): Promise<Job<any, any, string>> {
    const { queue, type, data } = publishEventDto;

    const valid = this.isValidType(queue, type);

    if (!valid) {
      throw new BadRequestException(
        `invalid type '${type}' for queue '${queue}'`,
      );
    }

    if (!this.queues[queue]) {
      throw new Error(`queue '${queue}' is not registered.`);
    }

    this.logger.log(`adding job to queue '${queue}', type '${type}'`);

    const job = await this.queues[queue].add(type, data, {
      attempts: parseInt(process.env.BULLMQ_RETRY_ATTEMPTS),
      backoff: {
        type: process.env.BULLMQ_BACKOFF_TYPE,
        delay: parseInt(process.env.BULLMQ_BACKOFF_DELAY),
      },
      ...options,
    });

    this.logger.log(`job added '${type}'`);

    return job;
  }

  isValidType(queue: EventQueue, type: string) {
    switch (queue) {
      case EventQueue.DEFAULT:
        return Object.values(DefaultEvent).includes(type as DefaultEvent);

      case EventQueue.NOTIFICATION:
        return Object.values(NotificationEvent).includes(
          type as NotificationEvent,
        );

      default:
        return false;
    }
  }
}
