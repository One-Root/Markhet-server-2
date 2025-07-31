import {
  IsEnum,
  IsUUID,
  IsString,
  IsISO8601,
  IsOptional,
  ValidateIf,
  IsNumberString,
} from 'class-validator';

import { Transform } from 'class-transformer';

import { CallStatus } from '../../../common/enums/call.enum';

import { formatMobileNumber } from '../../../common/utils/format-mobile-number.util';
import { IsValidMobileNumber } from '../../../common/decorators/is-valid-mobile-number.decorator';

export class DialActionDto {
  @IsNumberString()
  BillRate: string;

  @IsEnum(CallStatus)
  CallStatus: CallStatus;

  @IsUUID()
  CallUUID: string;

  @IsString()
  CallerName: string;

  @IsUUID()
  @ValidateIf((object) => object.DialALegUUID !== '')
  DialALegUUID: string;

  @IsUUID()
  @ValidateIf((object) => object.DialBLegUUID !== '')
  DialBLegUUID: string;

  @IsOptional()
  @IsString()
  DialBLegFrom?: string;

  @IsOptional()
  @IsString()
  DialBLegTo?: string;

  @IsString()
  DialHangupCause: string;

  @IsString()
  DialRingStatus: string;

  @IsEnum(CallStatus)
  DialStatus: CallStatus;

  @IsString()
  Direction: string;

  @IsString()
  Event: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  From: string;

  @IsString()
  ParentAuthID: string;

  @IsISO8601()
  SessionStart: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  To: string;
}
