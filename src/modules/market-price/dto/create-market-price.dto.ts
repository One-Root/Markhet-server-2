import {
  IsEnum,
  IsUUID,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';

import { CropName } from '../../../common/enums/farm.enum';
import { CropGrade } from '../../../common/enums/market-price.enum';

export class CreateMarketPriceDto {
  @IsEnum(CropName)
  cropName: CropName;

  @IsString()
  cropVariety?: string;

  @IsOptional()
  @IsEnum(CropGrade)
  grade?: CropGrade;

  @IsNumber()
  price: number;

  @IsUUID()
  marketId: string;
}
