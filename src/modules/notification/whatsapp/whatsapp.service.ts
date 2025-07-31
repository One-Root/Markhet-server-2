import { Logger, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';

import { User } from '@one-root/markhet-core';

import { Language } from '../../../common/enums/user.enum';
import { WhatsAppMessageType } from '../../../common/enums/notification.enum';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  private readonly id: string;
  private readonly url: string;
  private readonly token: string;

  constructor(private readonly httpService: HttpService) {
    const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_BUSINESS_API_ACCESS_TOKEN;
    const url = `https://graph.facebook.com/${process.env.WHATSAPP_BUSINESS_API_VERSION}`;

    if (!id || !token || !url) {
      throw new Error(
        'WhatsApp Business credentials are not set in environment variables',
      );
    }

    this.id = id;
    this.url = url;
    this.token = token;
  }

  async sendMessage(to: string, message: string) {
    // url
    const url = `${this.url}/${this.id}/messages`;

    // data
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    };

    // headers
    const headers = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };

    const response = await firstValueFrom(
      this.httpService.post(url, data, { headers }),
    );

    return response.data;
  }

  async sendTemplate(
    to: string,
    template: string,
    language: Language,
    components: any[] = [],
  ) {
    // url
    const url = `${this.url}/${this.id}/messages`;

    // data
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: template,
        language: { code: language },
        components,
      },
    };

    // headers
    const headers = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };

    const response = await firstValueFrom(
      this.httpService.post(url, data, { headers }),
    );

    return response.data;
  }

  async sendBulk(
    users: User[],
    type: WhatsAppMessageType,
    payload: {
      message?: string;
      template?: string;
      language?: Language;
      components?: any[];
    },
  ) {
    // url
    const url = `${this.url}/${this.id}/messages`;

    // headers
    const headers = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };

    const requests = users.map((user) => {
      // data
      const data = {
        messaging_product: 'whatsapp',
        type,
        to: user.mobileNumber,
      };

      if (type === WhatsAppMessageType.TEXT) {
        data['text'] = { body: payload.message };
      }

      if (type === WhatsAppMessageType.TEMPLATE) {
        data['template'] = {
          name: payload.template,
          language: { code: payload.language },
          components: payload.components,
        };
      }

      return firstValueFrom(this.httpService.post(url, data, { headers }));
    });

    const responses = await Promise.all(requests);

    return responses.map((response) => response.data);
  }
}
