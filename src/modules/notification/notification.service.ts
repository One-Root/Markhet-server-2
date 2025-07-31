import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { Notification } from '@one-root/markhet-core';

import { UserService } from '../user/user.service';

import { CreateBulkNotificationsDto } from './dto/create-bulk-notifications.dto';
import { MarkNotificationsAsReadDTO } from './dto/mark-notifications-as-read.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    private readonly userService: UserService,
  ) {}

  async bulkCreate(createBulkNotificationsDto: CreateBulkNotificationsDto) {
    const { title, body, isRead, channel, language, recipientIds } =
      createBulkNotificationsDto;

    const recipients = await this.userService.findByIds(recipientIds);

    // payload
    const notifications = recipients.map((recipient) => ({
      title,
      body,
      isRead,
      channel,
      language,
      recipient,
    }));

    await this.notificationRepository.save(notifications);
  }

  async markNotificationsAsRead(
    markNotificationsAsReadDTO: MarkNotificationsAsReadDTO,
  ) {
    const { notificationIds } = markNotificationsAsReadDTO;

    // filter
    const filter = {
      id: In(notificationIds),
    };

    // payload
    const payload = {
      isRead: true,
    };

    await this.notificationRepository.update(filter, payload);
  }
}
