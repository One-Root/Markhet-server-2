import { IsString, IsBoolean, IsOptional } from 'class-validator';

import { Transform } from 'class-transformer';

import { toBoolean } from '../../../common/utils/type-converters.util';

export class GetFarmCoordinatesQueryParamsDto {
  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsString()
  taluk?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isVerified?: boolean;
}
