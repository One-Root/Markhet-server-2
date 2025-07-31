import { IsString, IsNotEmpty } from 'class-validator';

import { Transform } from 'class-transformer';

import { formatMobileNumber } from '../../../common/utils/format-mobile-number.util';
import { IsValidMobileNumber } from '../../../common/decorators/is-valid-mobile-number.decorator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  template: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  mobileNumber: string;
}
