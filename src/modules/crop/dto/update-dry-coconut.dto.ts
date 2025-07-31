import { PartialType } from '@nestjs/mapped-types';

import { CreateDryCoconutDto } from './create-dry-coconut.dto';

export class UpdateDryCoconutDto extends PartialType(CreateDryCoconutDto) {}
