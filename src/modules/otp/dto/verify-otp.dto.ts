import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, Length } from 'class-validator';

import { formatMobileNumber } from '../../../common/utils/format-mobile-number.util';
import { IsValidMobileNumber } from '../../../common/decorators/is-valid-mobile-number.decorator';

export class VerifyOtpDto {
  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'OTP must be exactly 4 digits long' })
  otp: string;
}
