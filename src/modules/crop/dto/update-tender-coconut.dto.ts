import { PartialType } from '@nestjs/mapped-types';

import { CreateTenderCoconutDto } from './create-tender-coconut.dto';

export class UpdateTenderCoconutDto extends PartialType(
  CreateTenderCoconutDto,
) {}
