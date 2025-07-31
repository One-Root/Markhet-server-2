import { PartialType } from '@nestjs/mapped-types';

import { CreateBananaDto } from './create-banana.dto';

export class UpdateBananaDto extends PartialType(CreateBananaDto) {}
