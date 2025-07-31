import { IsEnum, IsUUID, IsOptional } from 'class-validator';

import { Transform } from 'class-transformer';

import { CropName } from '../../../common/enums/farm.enum';

import { formatMobileNumber } from '../../../common/utils/format-mobile-number.util';
import { IsValidMobileNumber } from '../../../common/decorators/is-valid-mobile-number.decorator';

export class CreateCallDto {
  @IsUUID()
  fromId: string;

  @IsUUID()
  toId: string;

  @IsOptional()
  @IsEnum(CropName)
  cropName?: CropName;

  @IsOptional()
  @IsUUID()
  cropId?: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  serviceNumber: string;
}
