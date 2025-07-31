import { PartialType } from '@nestjs/mapped-types';

import { CreateTurmericDto } from './create-turmeric.dto';

export class UpdateTurmericDto extends PartialType(CreateTurmericDto) {}
