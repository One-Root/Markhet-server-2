import { IsString, IsOptional } from 'class-validator';

import { Transform } from 'class-transformer';

import { formatMobileNumber } from '../../../common/utils/format-mobile-number.util';
import { IsValidMobileNumber } from '../../../common/decorators/is-valid-mobile-number.decorator';

export class IvrDto {
  @IsString()
  input: string;

  @IsOptional()
  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  from?: string;
}
