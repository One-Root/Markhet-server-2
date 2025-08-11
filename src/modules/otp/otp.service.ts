import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { lastValueFrom } from 'rxjs';

@Injectable()
export class OtpService {
  private readonly apiKey: string;

  constructor(private readonly httpService: HttpService) {
    this.apiKey = process.env['2FACTOR_API_KEY'];
  }

  async sendOtp(
    template: string,
    mobileNumber: string,
  ): Promise<{ details: string } | null> {
    const url = `https://2factor.in/API/V1/${this.apiKey}/SMS/${mobileNumber}/AUTOGEN3/${template}`;

    const response = await lastValueFrom(this.httpService.get(url));

    const sent = response.data.Status === 'Success';

    if (sent) {
      return {
        details: response.data.Details,
      };
    }

    return {
      details: null,
    };
  }

  async verifyOtp(
    mobileNumber: string,
    otp: string,
  ): Promise<{ valid: boolean }> {
    const url = `https://2factor.in/API/V1/${this.apiKey}/SMS/VERIFY3/${mobileNumber}/${otp}`;

    const response = await lastValueFrom(this.httpService.get(url));

    const valid = response.data.Status === 'Success';

    return {
      valid,
    };
  }
}
