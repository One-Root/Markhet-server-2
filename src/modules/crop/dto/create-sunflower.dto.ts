import {
  IsEnum,
  IsDateString,
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SunflowerVariety } from '../../../common/enums/crop.enum';
import { MetaDataDto } from 'src/common/dto/meta-data.dto';
import { CropCustomFieldsDto } from './base-crop.dto';

export class CreateSunflowerDto extends CropCustomFieldsDto {
  @IsOptional()
  @IsEnum(SunflowerVariety)
  sunflowerVariety: SunflowerVariety;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  nextHarvestDate?: string;

  @IsOptional()
  @IsString()
  lastHarvestDate?: string;

  @IsOptional()
  @IsBoolean()
  isReadyToHarvest?: boolean;

  @IsOptional()
  @IsNumber()
  generalHarvestCycleInDays?: number;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  meta?: { key: string; value: any }[];

  @IsOptional()
  @IsNumber()
  price?: number;
}
