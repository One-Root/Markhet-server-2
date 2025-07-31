import { IsInt, IsString, IsBoolean, IsOptional } from 'class-validator';

import { Transform } from 'class-transformer';

import {
  toNumber,
  toBoolean,
} from '../../../common/utils/type-converters.util';

export class GetDailyPricesQueryParamsDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value) || 1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value) || 10)
  limit: number = 10;

  // User
  @IsOptional()
  @IsString()
  user__village?: string;

  @IsOptional()
  @IsString()
  user__taluk?: string;

  @IsOptional()
  @IsString()
  user__district?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  user__isVerified?: boolean;
}
