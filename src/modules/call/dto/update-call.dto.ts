import {
  IsInt,
  IsEnum,
  IsUUID,
  IsArray,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

import { User } from '@one-root/markhet-core';

import { CallType, CallStatus } from '../../../common/enums/call.enum';

export class UpdateCallDto {
  @IsOptional()
  @IsString()
  parentAuthId?: string;

  @IsOptional()
  @IsString()
  conferenceName?: string;

  @IsOptional()
  @IsString()
  callUUID?: string;

  @IsEnum(CallStatus)
  @IsOptional()
  callStatus?: CallStatus;

  @IsEnum(CallType)
  @IsOptional()
  callType?: CallType;

  @IsOptional()
  @IsString()
  direction?: string;

  @IsOptional()
  @IsString()
  routeType?: string;

  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @IsString()
  hangupCause?: string;

  @IsOptional()
  @IsString()
  hangupCauseName?: string;

  @IsOptional()
  @IsString()
  hangupSource?: string;

  @IsOptional()
  @IsString()
  stirAttestation?: string;

  @IsOptional()
  @IsString()
  stirVerification?: string;

  @IsOptional()
  @IsString()
  recordingUrl?: string;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsDateString()
  startStamp?: string;

  @IsOptional()
  @IsDateString()
  endStamp?: string;

  @IsOptional()
  agent?: User;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  participants?: User[];
}
