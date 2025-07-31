import { CropName } from '../enums/farm.enum';

interface BulkUpdate {
  id: string;
  score?: number;
  cropName?: CropName;
  nextHarvestDate?: Date;
  lastHarvestDate?: Date;
  isReadyToHarvest?: boolean;
}

export { BulkUpdate };
