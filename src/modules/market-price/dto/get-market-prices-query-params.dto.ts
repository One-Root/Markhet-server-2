import { IsEnum, IsString, IsOptional } from 'class-validator';

import { CropName } from '../../../common/enums/farm.enum';

export class GetMarketPricesQueryParamsDto {
  @IsOptional()
  @IsEnum(CropName)
  cropName?: CropName;

  @IsOptional()
  @IsString()
  cropVariety?: string;
}
