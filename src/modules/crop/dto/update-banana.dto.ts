import { PartialType, IntersectionType } from '@nestjs/mapped-types';
import { CreateBananaDto } from './create-banana.dto';
import { CropCustomFieldsDto } from './base-crop.dto';
export class UpdateBananaDto extends IntersectionType(
  PartialType(CreateBananaDto),
  CropCustomFieldsDto,
) {}
