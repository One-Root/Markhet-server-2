import {
  IsInt,
  IsEnum,
  Length,
  IsArray,
  IsString,
  IsOptional,
  ArrayNotEmpty,
} from 'class-validator';

import { Transform } from 'class-transformer';

import { CropName } from '../../../common/enums/farm.enum';
import { MarketOrigin } from '../../../common/enums/market.enum';

import { toNumber } from '../../../common/utils/type-converters.util';

export class GetMarketsQueryParamsDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value) || 1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value) || 10)
  limit: number = 10;

  @IsOptional()
  @IsEnum(MarketOrigin)
  origin: MarketOrigin;

  @IsOptional()
  @IsString()
  taluk?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  pincode?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(CropName, { each: true })
  @ArrayNotEmpty()
  cropNames__contains: CropName[];
}
