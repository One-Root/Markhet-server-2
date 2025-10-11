import { CropCardStatus } from '../enums/crop-card.enum';
import { CropCardEndReason } from '../enums/crop-card-end-reason.enum';
import { CropType } from './crop.type';

export type CropCardData = {
  cropId: string;
  farmerId: string;
  cropSnapshot: CropType;
  estimatedQuantity?: number;
  quantityUnit?: string;
  expectedHarvestDate?: Date;
  additionalNotes?: string;
  status?: CropCardStatus;
};

export type CropCardUpdateData = {
  status?: CropCardStatus;
  estimatedQuantity?: number;
  quantityUnit?: string;
  expectedHarvestDate?: Date;
  additionalNotes?: string;
  endedAt?: Date;
  endReason?: CropCardEndReason;
};
