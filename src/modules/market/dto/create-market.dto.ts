import {
  Length,
  IsEnum,
  IsArray,
  IsString,
  IsObject,
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
} from 'class-validator';

import { MarketOrigin } from '../../../common/enums/market.enum';
import { CropName, GeoJsonType } from '../../../common/enums/farm.enum';

export class CreateMarketDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MarketOrigin)
  origin: MarketOrigin;

  @IsArray()
  @IsEnum(CropName, { each: true })
  @ArrayNotEmpty()
  cropNames: CropName[];

  @IsString()
  @IsNotEmpty()
  taluk: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  pincode: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsObject()
  @IsOptional()
  coordinates: {
    type: GeoJsonType;
    coordinates: [number, number];
  };
}
