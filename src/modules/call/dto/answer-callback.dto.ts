import {
  IsEnum,
  IsUUID,
  IsString,
  IsOptional,
  IsNumberString,
} from 'class-validator';

import { Transform } from 'class-transformer';

import { CallStatus } from '../../../common/enums/call.enum';

import { formatMobileNumber } from '../../../common/utils/format-mobile-number.util';
import { IsValidISO8601 } from '../../../common/decorators/is-valid-iso08601.decorator';
import { IsValidMobileNumber } from '../../../common/decorators/is-valid-mobile-number.decorator';

export class AnswerCallbackDto {
  @IsOptional()
  @IsString()
  ParentAuthID?: string;

  @IsUUID()
  CallUUID: string;

  @IsOptional()
  @IsEnum(CallStatus)
  CallStatus?: CallStatus;

  @IsOptional()
  @IsNumberString()
  BillRate?: string;

  @IsOptional()
  @IsString()
  CallerName?: string;

  @IsOptional()
  @IsString()
  Direction?: string;

  @IsUUID()
  DialALegUUID: string;

  @IsString()
  DialAction: string;

  @IsNumberString()
  DialBLegBillRate: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  DialBLegFrom: string;

  @IsString()
  DialBLegPosition: string;

  @IsString()
  DialBLegStatus: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  DialBLegTo: string;

  @IsUUID()
  DialBLegUUID: string;

  @IsString()
  Event: string;

  @IsOptional()
  @IsValidISO8601()
  SessionStart?: string;

  @IsOptional()
  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  From?: string;

  @IsOptional()
  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  To?: string;

  @IsOptional()
  @IsValidISO8601()
  AnswerTime?: string;

  @IsOptional()
  @IsValidISO8601()
  EndTime?: string;

  @IsOptional()
  @IsValidISO8601()
  StartTime?: string;

  @IsOptional()
  @IsString()
  DialBLegHangupCause?: string;

  @IsOptional()
  @IsString()
  DialBLegHangupCauseCode?: string;

  @IsOptional()
  @IsString()
  DialBLegHangupCauseName?: string;

  @IsOptional()
  @IsString()
  DialBLegHangupSource?: string;

  @IsOptional()
  @IsNumberString()
  DialBLegTotalCost?: string;

  @IsOptional()
  @IsString()
  DialBLegDuration?: string;

  @IsOptional()
  @IsString()
  DialBLegBillDuration?: string;

  @IsOptional()
  @IsString()
  DialBLegSTIRAttestation?: string;

  @IsOptional()
  @IsString()
  DialBLegSTIRVerification?: string;
}
