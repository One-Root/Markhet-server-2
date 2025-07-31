import { Logger, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';

import { User } from '@one-root/markhet-core';

import { Language } from '../../../common/enums/user.enum';
import { WhatsAppMessageType } from '../../../common/enums/notification.enum';
import { CropName } from 'src/common/enums/farm.enum';

@Injectable()
export class ChatraceService {
  private readonly logger = new Logger(ChatraceService.name);

  private readonly id: string;
  private readonly url: string;
  private readonly token: string;
  private readonly chatraceAPIKey: string;

  constructor(private readonly httpService: HttpService) {
    const ChatraceAPIkey = process.env.CHATRACE_API_KEY;
    this.chatraceAPIKey = ChatraceAPIkey;
  }

  async sendWhatsAppCropReadyMessage(data: {
    number: string;
    name: string;
    status: string;
    cropName: CropName;
  }) {
    try {
      const { number, name, status, cropName } = data;
      const sanitized = number.startsWith('+91') ? number : `+91${number}`;

      const resp = await fetch('https://api.chatrace.com/users', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-ACCESS-TOKEN': this.chatraceAPIKey!,
        },
        body: JSON.stringify({
          phone: name,
          first_name: name,
          last_name: 'farmer',
          gender: 'male',
          actions: [{ action: 'send_flow', flow_id: 1752145185096 }],
        }),
      });

      if (!resp.ok) {
        console.error(
          `Chatrace API error for ${sanitized}:`,
          await resp.text(),
        );
      }

      return { resp };
    } catch (err: any) {
      console.error('error sending whatsapp flow to harvestor', err);
      return { status: 'error sending whatsapp flow to harvestor' };
    }
  }

  async sendRTHMessage(data: {
    number: string;
    name: string;
    NHD: string;
    cropName: string;
    noOfTrees: number;
    flowId: number;
  }) {
    const { number, name, NHD, cropName, noOfTrees, flowId } = data;
    const sanitized = number.startsWith('+91') ? number : `+91${number}`;

    if (!this.chatraceAPIKey) {
      this.logger.warn(
        `Chatrace API key missing—skipping message to ${sanitized}`,
      );
      return { skipped: true, reason: 'no-api-key' };
    }

    let resp: Response;
    let payload: any;
    try {
      resp = await fetch('https://api.chatrace.com/users', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-ACCESS-TOKEN': this.chatraceAPIKey,
        },
        body: JSON.stringify({
          phone: sanitized,
          first_name: name,
          last_name: 'farmer',
          gender: 'male',
          actions: [
            {
              action: 'set_field_value',
              field_name: 'no_of_trees',
              value: noOfTrees,
            },
            { action: 'set_field_value', field_name: 'name', value: name },
            { action: 'set_field_value', field_name: 'crop', value: cropName },
            { action: 'set_field_value', field_name: 'ndh', value: NHD },
            { action: 'send_flow', flow_id: flowId },
          ],
        }),
      });

      payload = await resp.json();
    } catch (err) {
      this.logger.error(`Chatrace request failed for ${sanitized}`, err);
      return { success: false, error: 'network-or-parse-error' };
    }

    if (!resp.ok) {
      this.logger.error(`Chatrace API error for ${sanitized}:`, payload);
      return { success: false, status: resp.status, payload };
    }

    this.logger.log(
      `Chatrace message sent to ${sanitized}: flow triggered`,
      payload,
    );
    return { success: true, status: resp.status, payload };
  }
}
