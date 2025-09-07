import { PartialType, IntersectionType } from '@nestjs/mapped-types';

import { CreateDryCoconutDto } from './create-dry-coconut.dto';

import { CropCustomFieldsDto } from './base-crop.dto';

export class UpdateDryCoconutDto extends IntersectionType(
  PartialType(CreateDryCoconutDto),
  CropCustomFieldsDto,
) {}
