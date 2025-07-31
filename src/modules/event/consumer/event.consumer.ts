import { Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';

import { Job } from 'bullmq';

import { UserService } from 'src/modules/user/user.service';
import { WhatsAppService } from '../../notification/whatsapp/whatsapp.service';
import { PushNotificationService } from '../../notification/push-notification/push-notification.service';

import {
  EventQueue,
  NotificationEvent,
} from '../../../common/enums/event.enum';
import { ChatraceService } from 'src/modules/notification/chatrace/chatrace.service';

@Processor(EventQueue.NOTIFICATION)
export class EventConsumer extends WorkerHost {
  private readonly logger = new Logger(EventConsumer.name);

  constructor(
    private readonly userService: UserService,

    private readonly whatsAppService: WhatsAppService,

    private readonly pushNotificationService: PushNotificationService,

    private readonly chatraceService: ChatraceService,
  ) {
    super();
  }

  async process(job: Job<any>) {
    this.logger.log(`processing job '${job.name}', job id ${job.id}`);

    const { data, language, userIds } = job.data;

    switch (job.name) {
      case NotificationEvent.WHATSAPP:
        const { type, message, template, components } = data;

        const users = await this.userService.findByIds(userIds);

        await this.whatsAppService.sendBulk(users, type, {
          message,
          language,
          template,
          components,
        });

        break;

      case NotificationEvent.PUSH:
        const { title, body, link } = data;

        const tokens = await this.userService.getFcmTokensByUserIds(userIds);

        await this.pushNotificationService.sendNotification(
          tokens,
          title,
          body,
          { link },
        );

        break;

      case NotificationEvent.CHATRACE_RTH:
        console.log(`processing job '${job.name}', job id ${job.id}`);
        const { number, name, status, cropName } = job.data;

        const res = await this.chatraceService.sendWhatsAppCropReadyMessage({
          number,
          name,
          status,
          cropName,
        });

        if (res.resp) {
          this.logger.log(
            `Chatrace API response for ${number}: ${JSON.stringify(res.resp)}`,
          );
        } else {
          this.logger.error(
            `Chatrace API error for ${number}: ${JSON.stringify(res)}`,
          );
        }

        break;

      default:
        throw new Error(`unknown job type '${job.name}'`);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`job ${job.name}, job id ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `job ${job.name}, job id ${job.id} failed '${err.message}'`,
    );
  }
}
