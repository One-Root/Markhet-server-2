import { Controller, Post, Body, HttpStatus } from '@nestjs/common';

import { OtpService } from './otp.service';

import { SendOtpDto } from './dto/send-otp.dto';

import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  async sendOtp(
    @Body() sendOtpDto: SendOtpDto,
  ): Promise<ApiResponse<{ details: string } | null>> {
    const { template, mobileNumber } = sendOtpDto;

    const data = await this.otpService.sendOtp(template, mobileNumber);

    return new ApiResponse(HttpStatus.OK, 'OTP sent successfully', {
      details: data.details,
    });
  }
}
