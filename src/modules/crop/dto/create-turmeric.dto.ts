import {
  Min,
  IsInt,
  IsEnum,
  IsArray,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { MetaDataDto } from '../../../common/dto/meta-data.dto';

import { TurmericVariety } from '../../../common/enums/crop.enum';
import { CropCustomFieldsDto } from './base-crop.dto';

export class CreateTurmericDto extends CropCustomFieldsDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsEnum(TurmericVariety)
  turmericVariety: TurmericVariety;

  @IsOptional()
  @IsBoolean()
  isHarvested?: boolean;

  @IsOptional()
  @IsBoolean()
  isOrganic?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  generalHarvestCycleInDays?: number;

  @IsOptional()
  @IsBoolean()
  isPolished?: boolean;

  @IsOptional()
  @IsBoolean()
  isUnpolished?: boolean;

  @IsOptional()
  @IsBoolean()
  isSinglePolished?: boolean;

  @IsOptional()
  @IsBoolean()
  isDoublePolished?: boolean;

  @IsOptional()
  @IsBoolean()
  isRaw?: boolean;

  @IsOptional()
  @IsBoolean()
  isRegular?: boolean;

  @IsOptional()
  @IsString()
  nextHarvestDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fingerQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bulbQuantity?: number;

  @IsOptional()
  @IsBoolean()
  isIPM?: boolean;

  @IsOptional()
  @IsBoolean()
  isReadyToHarvest?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  images?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  @IsOptional()
  meta: { key: string; value: any }[] = [];
}
