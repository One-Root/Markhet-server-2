import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User, NotificationTemplate } from '@one-root/markhet-core';

import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto';

import { replaceVariables } from '../../common/utils/replace-variables.util';

@Injectable()
export class NotificationTemplateService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private readonly notificationTemplateRepository: Repository<NotificationTemplate>,
  ) {}

  async findOne(
    id: string,
    data: Record<string, any>,
  ): Promise<NotificationTemplate> {
    const notificationTemplate =
      await this.notificationTemplateRepository.findOne({
        where: { id },
      });

    if (!notificationTemplate) {
      throw new NotFoundException(
        `notification template with id ${id} not found`,
      );
    }

    const { title, body, ...rest } = notificationTemplate;

    return {
      title: replaceVariables(title, data),
      body: replaceVariables(body, data),
      ...rest,
    };
  }

  async create(
    user: User,
    createNotificationTemplateDto: CreateNotificationTemplateDto,
  ): Promise<NotificationTemplate> {
    // payload
    const payload = {
      ...createNotificationTemplateDto,
      creator: user,
    };

    const notificationTemplate =
      this.notificationTemplateRepository.create(payload);

    return this.notificationTemplateRepository.save(notificationTemplate);
  }
}
