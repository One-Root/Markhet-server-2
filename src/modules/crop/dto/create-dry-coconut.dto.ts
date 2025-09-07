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

import { DryCoconutVariety } from '../../../common/enums/crop.enum';
import { CropCustomFieldsDto } from './base-crop.dto';

export class CreateDryCoconutDto extends CropCustomFieldsDto {
  @IsOptional()
  @IsBoolean()
  isHarvested?: boolean;

  @IsOptional()
  @IsBoolean()
  isOnTree?: boolean;

  @IsOptional()
  @IsEnum(DryCoconutVariety)
  dryCoconutVariety: DryCoconutVariety;

  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfTrees?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfNutsAvailable?: number;

  @IsOptional()
  @IsBoolean()
  isWithSemiHusk?: boolean;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  generalHarvestCycleInDays?: number;

  @IsOptional()
  @IsString()
  nextHarvestDate?: string;

  @IsOptional()
  @IsBoolean()
  isWithHusk?: boolean;

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
