// src/modules/crop/dto/create-sunflower.dto.ts

import {
  IsEnum,
  IsDateString,
  IsNumber,
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { SunflowerVariety } from '../../../common/enums/crop.enum';

export class CreateSunflowerDto {
  @IsNotEmpty()
  @IsEnum(SunflowerVariety) // This will now use the correct enum
  sunflowerVariety: SunflowerVariety;

  @IsDateString()
  nextHarvestDate: Date;

  @IsNumber()
  quantity: number;

  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @IsString()
  customField1: string;

  @IsString()
  customField2: string;

  @IsString()
  customField3: string;

  @IsNumber()
  customField4: number;

  @IsNumber()
  customField5: number;

  @IsBoolean()
  customField6: boolean;

  @IsOptional()
  customField7: any;
}
