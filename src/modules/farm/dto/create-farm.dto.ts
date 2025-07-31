import {
  Length,
  IsEnum,
  IsString,
  IsObject,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

import { Weather, GeoJsonType } from '../../../common/enums/farm.enum';

export class CreateFarmDto {
  @IsOptional()
  @IsEnum(Weather)
  weather?: Weather;

  @IsOptional()
  @IsString()
  lastWeatherUpdateAt?: Date;

  @IsString()
  village: string;

  @IsString()
  taluk: string;

  @IsString()
  district: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  pincode: string;

  @IsObject()
  coordinates: {
    type: GeoJsonType;
    coordinates: [number, number];
  };
}
