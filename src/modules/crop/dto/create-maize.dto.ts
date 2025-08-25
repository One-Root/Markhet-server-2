import {
  Min,
  IsInt,
  IsEnum,
  IsArray,
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { MetaDataDto } from '../../../common/dto/meta-data.dto';

import { MaizeVariety } from '../../../common/enums/crop.enum';
import { CropCustomFieldsDto } from './base-crop.dto';

export class CreateMaizeDto extends CropCustomFieldsDto {
  @IsEnum(MaizeVariety)
  maizeVariety: MaizeVariety;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ageOfTree?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfTrees?: number;

  @IsOptional()
  @IsBoolean()
  isOrganic?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  chutePercentage?: number;

  @IsOptional()
  @IsString()
  nextHarvestDate?: string;

  @IsOptional()
  @IsString()
  lastHarvestDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  nutsFromLastHarvest?: number;

  @IsOptional()
  @IsBoolean()
  isReadyToHarvest?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  generalHarvestCycleInDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;

  @IsOptional()
  @IsBoolean()
  hasSpots?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  @IsOptional()
  meta: { key: string; value: any }[] = [];
}
