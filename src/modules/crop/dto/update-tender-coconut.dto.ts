import { PartialType, IntersectionType } from '@nestjs/mapped-types';

import { CreateTenderCoconutDto } from './create-tender-coconut.dto';
import { CropCustomFieldsDto } from './base-crop.dto';

export class UpdateTenderCoconutDto extends IntersectionType(
  PartialType(CreateTenderCoconutDto),
  CropCustomFieldsDto,
) {}
