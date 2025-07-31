import { IsString, IsNumber, IsEnum } from 'class-validator';

import { CropName } from '../../../common/enums/farm.enum';

export class CreateDailyPriceDto {
  @IsEnum(CropName)
  cropName: CropName;

  @IsString()
  cropVariety: string;

  @IsNumber()
  price: number;
}
