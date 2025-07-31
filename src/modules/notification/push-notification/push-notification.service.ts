import { Logger, Injectable } from '@nestjs/common';

import * as admin from 'firebase-admin';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor() {
    const file = process.env.GCP_SERVICE_ACCOUNT_CREDENTIALS;

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(file),
      });
    }
  }

  async sendNotification(
    target: string | string[],
    title: string,
    body: string,
    data: Record<string, string> = {},
    options?: {
      android?: admin.messaging.AndroidConfig;
      apns?: admin.messaging.ApnsConfig;
      webpush?: admin.messaging.WebpushConfig;
    },
  ): Promise<void> {
    try {
      const payload = {
        data: {
          title,
          body,
          ...Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, String(value)]),
          ),
        },
        android: options?.android,
        apns: options?.apns,
        webpush: options?.webpush,
      };

      if (Array.isArray(target)) {
        // handle multiple tokens
        const responses = await this.sendToMultipleDevices(target, payload);

        this.logger.log(`batch responses: ${JSON.stringify(responses)}`);
      } else if (target.startsWith('/topics/')) {
        // topic-based notification
        await admin.messaging().send({
          ...payload,
          topic: target.replace('/topics/', ''),
        });

        this.logger.log(`notification sent to topic: ${target}`);
      } else {
        // single token notification
        await admin.messaging().send({
          ...payload,
          token: target,
        });

        this.logger.log(`notification sent to device: ${target}`);
      }
    } catch (error) {
      this.logger.error(
        `failed to send notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async sendToMultipleDevices(
    tokens: string[],
    message: Omit<admin.messaging.Message, 'token' | 'topic' | 'condition'>,
  ): Promise<admin.messaging.BatchResponse[]> {
    const MAX_BATCH_SIZE = 500;
    const responses: admin.messaging.BatchResponse[] = [];

    for (let i = 0; i < tokens.length; i += MAX_BATCH_SIZE) {
      const chunk = tokens.slice(i, i + MAX_BATCH_SIZE);

      const batchResponse = await admin.messaging().sendEachForMulticast({
        tokens: chunk,
        notification: message.notification,
        data: message.data,
        android: message.android,
        apns: message.apns,
        webpush: message.webpush,
      });

      responses.push(batchResponse);
    }

    return responses;
  }
}
