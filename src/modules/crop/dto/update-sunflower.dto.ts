import { PartialType, IntersectionType } from '@nestjs/mapped-types';
import { CreateSunflowerDto } from './create-sunflower.dto';
import { CropCustomFieldsDto } from './base-crop.dto';

// Makes all fields from the create DTO optional for updates.
export class UpdateSunflowerDto extends IntersectionType(
  PartialType(CreateSunflowerDto),
  CropCustomFieldsDto,
) {}
