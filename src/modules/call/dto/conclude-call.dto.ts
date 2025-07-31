import {
  IsEnum,
  IsUUID,
  IsNumber,
  IsString,
  IsISO8601,
  IsOptional,
  IsNumberString,
} from 'class-validator';

import { Transform } from 'class-transformer';

import { CallStatus } from '../../../common/enums/call.enum';

import { toFloat } from '../../../common/utils/type-converters.util';
import { formatMobileNumber } from '../../../common/utils/format-mobile-number.util';
import { IsValidISO8601 } from '../../../common/decorators/is-valid-iso08601.decorator';
import { IsValidMobileNumber } from '../../../common/decorators/is-valid-mobile-number.decorator';

export class ConcludeCallDto {
  @IsString()
  ParentAuthID: string;

  @IsNumberString()
  BillRate: string;

  @IsNumberString()
  BillDuration: string;

  @IsEnum(CallStatus)
  CallStatus?: CallStatus;

  @IsUUID()
  CallUUID: string;

  @IsOptional()
  @IsString()
  CallerName?: string;

  @IsOptional()
  @IsString()
  DialSession?: string;

  @IsString()
  Direction: string;

  @IsString()
  Event: string;

  @IsString()
  STIRAttestation: string;

  @IsString()
  STIRVerification: string;

  @IsValidISO8601()
  SessionStart: string;

  @IsValidISO8601()
  StartTime: string;

  @IsValidISO8601()
  AnswerTime: string;

  @IsValidISO8601()
  EndTime: string;

  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  Duration: number;

  @IsNumberString()
  TotalCost: string;

  @IsString()
  HangupCause: string;

  @IsNumberString()
  HangupCauseCode: string;

  @IsString()
  HangupCauseName: string;

  @IsString()
  HangupSource: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  From: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  To: string;
}
