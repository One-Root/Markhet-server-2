import {
  IsInt,
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
} from 'class-validator';

import { Transform } from 'class-transformer';

import { CropName } from '../../../common/enums/farm.enum';
import {
  BananaVariety,
  TurmericVariety,
  TenderCoconutVariety,
} from '../../../common/enums/crop.enum';

import {
  toDate,
  toFloat,
  toNumber,
  toBoolean,
} from '../../../common/utils/type-converters.util';

export class GetCropsQueryParamsDto {
  @IsEnum(CropName)
  cropName: CropName;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value) || 1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value) || 10)
  limit: number = 10;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isReadyToHarvest?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isOrganic?: boolean;

  // Tender Coconut
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  ageOfTree?: number;

  // ageOfTree range filters (gte, lte, etc.)
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  ageOfTree__gte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  ageOfTree__lte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  ageOfTree__gt?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  ageOfTree__lt?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  numberOfTrees?: number;

  // numberOfTrees range filters (gte, lte, etc.)
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  numberOfTrees__gte?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  numberOfTrees__lte?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  numberOfTrees__gt?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  numberOfTrees__lt?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toNumber(value))
  heightOfTree?: number;

  // heightOfTree range filters (gte, lte, etc.)
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  heightOfTree__gte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  heightOfTree__lte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  heightOfTree__gt?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  heightOfTree__lt?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  chutePercentage?: number;

  // chutePercentage range filters (gte, lte, etc.)
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  chutePercentage__gte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  chutePercentage__lte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  chutePercentage__gt?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  chutePercentage__lt?: number;

  @IsEnum(TenderCoconutVariety)
  @IsOptional()
  tenderCoconutVariety?: TenderCoconutVariety;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  nutsFromLastHarvest?: number;

  // nutsFromLastHarvest range filters (gte, lte, etc.)
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  nutsFromLastHarvest__gte?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  nutsFromLastHarvest__lte?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  nutsFromLastHarvest__gt?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  nutsFromLastHarvest__lt?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  generalHarvestCycleInDays?: number;

  // generalHarvestCycleInDays range filters (gte, lte, etc.)
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  generalHarvestCycleInDays__gte?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  generalHarvestCycleInDays__lte?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  generalHarvestCycleInDays__gt?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => toNumber(value))
  generalHarvestCycleInDays__lt?: number;

  @IsOptional()
  @Transform(({ value }) => toDate(value))
  nextHarvestDate?: Date;

  // nextHarvestDate range filters (gte, lte, etc.)
  @IsOptional()
  @Transform(({ value }) => toDate(value))
  nextHarvestDate__gte?: Date;

  @IsOptional()
  @Transform(({ value }) => toDate(value))
  nextHarvestDate__lte?: Date;

  @IsOptional()
  @Transform(({ value }) => toDate(value))
  nextHarvestDate__gt?: Date;

  @IsOptional()
  @Transform(({ value }) => toDate(value))
  nextHarvestDate__lt?: Date;

  @IsOptional()
  @Transform(({ value }) => toDate(value))
  lastHarvestDate?: Date;

  // lastHarvestDate range filters (gte, lte, etc.)
  @IsOptional()
  @Transform(({ value }) => toDate(value))
  lastHarvestDate__gte?: Date;

  @IsOptional()
  @Transform(({ value }) => toDate(value))
  lastHarvestDate__lte?: Date;

  @IsOptional()
  @Transform(({ value }) => toDate(value))
  lastHarvestDate__gt?: Date;

  @IsOptional()
  @Transform(({ value }) => toDate(value))
  lastHarvestDate__lt?: Date;

  // Turmeric
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsEnum(TurmericVariety)
  turmericVariety?: TurmericVariety;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isPolished?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isUnpolished?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isSinglePolished?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isDoublePolished?: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  totalQuantity?: number;

  // totalQuantity range filters (gte, lte, etc.)
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  totalQuantity__gte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  totalQuantity__lte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  totalQuantity__gt?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  totalQuantity__lt?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  fingerQuantity?: number;

  // fingerQuantity range filters (gte, lte, etc.)
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  fingerQuantity__gte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  fingerQuantity__lte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  fingerQuantity__gt?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  fingerQuantity__lt?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  bulbQuantity?: number;

  // bulbQuantity range filters (gte, lte, etc.)
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  bulbQuantity__gte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  bulbQuantity__lte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  bulbQuantity__gt?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  bulbQuantity__lt?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isIPM?: boolean;

  // Banana
  @IsOptional()
  @IsEnum(BananaVariety)
  bananaVariety?: BananaVariety;

  @IsOptional()
  @IsString()
  tarShape?: string;

  // Dry Coconut
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isHarvested?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isOnTree?: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  numberOfNutsAvailable?: number;

  // numberOfNutsAvailable range filters (gte, lte, etc.)
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  numberOfNutsAvailable__gte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  numberOfNutsAvailable__lte?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  numberOfNutsAvailable__gt?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => toFloat(value))
  numberOfNutsAvailable__lt?: number;

  // Farm
  @IsOptional()
  @IsString()
  farm__village?: string;

  @IsOptional()
  @IsString()
  farm__taluk?: string;

  @IsOptional()
  @IsString()
  farm__district?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  farm__isVerified?: boolean;

  // User
  @IsOptional()
  @IsString()
  farm__user__village?: string;

  @IsOptional()
  @IsString()
  farm__user__taluk?: string;

  @IsOptional()
  @IsString()
  farm__user__district?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  farm__user__isVerified?: boolean;
}
