import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as Stream from 'getstream';

@Injectable()
export class GetStreamService {
  private client: Stream.StreamClient;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly appId: string;
  private readonly tokenExpiry: number;

  constructor() {
    this.apiKey = process.env.GETSTREAM_API_KEY;
    this.apiSecret = process.env.GETSTREAM_API_SECRET;
    this.appId = process.env.GETSTREAM_APP_ID;
    this.tokenExpiry =
      parseInt(process.env.GETSTREAM_TOKEN_EXPIRY, 10) || 86400;

    this.client = Stream.connect(this.apiKey, this.apiSecret, this.appId);
  }

  generateToken(userId: string): string {
    try {
      const expiryTimestamp = Math.floor(Date.now() / 1000) + this.tokenExpiry;

      const token = this.client.createUserToken(userId, {
        exp: expiryTimestamp,
      });

      return token;
    } catch (error) {
      throw new InternalServerErrorException(
        'failed to generate Stream token',
        error.message,
      );
    }
  }
}
