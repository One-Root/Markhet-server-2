import { PartialType, IntersectionType } from '@nestjs/mapped-types';

import { CreateTurmericDto } from './create-turmeric.dto';

import { CropCustomFieldsDto } from './base-crop.dto';

export class UpdateTurmericDto extends IntersectionType(
  PartialType(CreateTurmericDto),
  CropCustomFieldsDto,
) {}
