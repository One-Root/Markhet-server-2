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

import { BananaVariety } from '../../../common/enums/crop.enum';

export class CreateBananaDto {
  @IsEnum(BananaVariety)
  bananaVariety: BananaVariety;

  @IsOptional()
  @IsString()
  tarShape?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tarWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfTrees?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfTreesRTH?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  generalHarvestCycleInDays?: number;

  @IsOptional()
  @IsString()
  nextHarvestDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  cutCount?: number;

  @IsOptional()
  @IsString()
  cutType?: string;

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
