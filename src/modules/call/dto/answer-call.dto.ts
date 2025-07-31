import {
  IsEnum,
  IsUUID,
  IsString,
  IsISO8601,
  IsNumberString,
} from 'class-validator';

import { Transform } from 'class-transformer';

import { CallStatus } from '../../../common/enums/call.enum';

import { formatMobileNumber } from '../../../common/utils/format-mobile-number.util';
import { IsValidMobileNumber } from '../../../common/decorators/is-valid-mobile-number.decorator';

export class AnswerCallDto {
  @IsString()
  ParentAuthID: string;

  @IsNumberString()
  BillRate: string;

  @IsEnum(CallStatus)
  CallStatus?: CallStatus;

  @IsUUID()
  CallUUID: string;

  @IsString()
  CallerName: string;

  @IsString()
  CountryCode: string;

  @IsString()
  Direction: string;

  @IsString()
  Event: string;

  @IsString()
  RouteType: string;

  @IsString()
  STIRAttestation: string;

  @IsString()
  STIRVerification: string;

  @IsISO8601()
  SessionStart: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  From: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  To: string;
}
