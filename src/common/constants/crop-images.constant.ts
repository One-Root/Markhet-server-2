import { CropName } from '../enums/farm.enum';
export const CROP_IMAGE_MAP: Record<CropName, string> = {
  [CropName.TENDER_COCONUT]: 'https://example.com/images/tender_coconut.jpg',
  [CropName.TURMERIC]: 'https://example.com/images/turmeric.jpg',
  [CropName.BANANA]: 'https://example.com/images/banana.jpg',
  [CropName.DRY_COCONUT]: 'https://example.com/images/dry_coconut.jpg',
  [CropName.SUNFLOWER]: 'https://example.com/images/sunflower.jpg',
  [CropName.MAIZE]: '',
};
