import { CropReportedByEnum, CropStatusEnum } from '../enums/crop.enum';
import { CropName } from '../enums/farm.enum';

interface BulkUpdate {
  id: string;
  score?: number;
  cropName?: CropName;
  nextHarvestDate?: Date;
  lastHarvestDate?: Date;
  isReadyToHarvest?: boolean;
  cropStatus?: CropStatusEnum;
  reportedBy?: CropReportedByEnum;
}

export { BulkUpdate };
