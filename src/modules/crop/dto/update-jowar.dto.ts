import { PartialType, IntersectionType } from '@nestjs/mapped-types';
import { CreateJowarDto } from './create-jowar.dto';
import { CropCustomFieldsDto } from './base-crop.dto';
// Makes all fields from the create DTO optional for updates.
export class UpdateJowarDto extends IntersectionType(
  PartialType(CreateJowarDto),
  CropCustomFieldsDto,
) {}
