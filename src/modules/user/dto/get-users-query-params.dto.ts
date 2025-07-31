import {
  IsInt,
  IsEnum,
  IsArray,
  IsString,
  IsBoolean,
  IsOptional,
  ArrayNotEmpty,
} from 'class-validator';

import { Transform } from 'class-transformer';

import {
  toNumber,
  toBoolean,
} from '../../../common/utils/type-converters.util';

import { Identity } from '../../../common/enums/user.enum';
import { CropName } from '../../../common/enums/farm.enum';

export class GetUsersQueryParamsDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value) || 1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value) || 10)
  limit: number = 10;

  @IsOptional()
  @IsEnum(Identity)
  identity?: Identity;

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

  @IsOptional()
  @IsArray()
  @IsEnum(CropName, { each: true })
  @ArrayNotEmpty()
  cropNames__contains: CropName[];
}
