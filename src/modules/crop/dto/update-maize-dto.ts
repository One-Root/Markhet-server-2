import { PartialType, IntersectionType } from '@nestjs/mapped-types';
import { CreateMaizeDto } from './create-maize.dto';
import { CropCustomFieldsDto } from './base-crop.dto';
// Makes all fields from the create DTO optional for updates.
export class UpdateMaizeDto extends IntersectionType(
  PartialType(CreateMaizeDto),
  CropCustomFieldsDto,
) {}
