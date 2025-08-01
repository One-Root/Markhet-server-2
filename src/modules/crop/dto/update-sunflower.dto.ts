import { PartialType } from '@nestjs/mapped-types';
import { CreateSunflowerDto } from './create-sunflower.dto';

// Makes all fields from the create DTO optional for updates.
export class UpdateSunflowerDto extends PartialType(CreateSunflowerDto) {}
