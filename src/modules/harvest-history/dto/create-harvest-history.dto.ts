import { IsEnum, IsUUID, IsNotEmpty } from 'class-validator';

import { CropName } from '../../../common/enums/farm.enum';
import { HarvestStatus } from '../../../common/enums/harvest-history.enum';

export class CreateHarvestHistoryDto {
  @IsUUID()
  @IsNotEmpty()
  cropId: string;

  @IsEnum(CropName)
  cropName: CropName;

  @IsEnum(HarvestStatus)
  status: HarvestStatus;
}
