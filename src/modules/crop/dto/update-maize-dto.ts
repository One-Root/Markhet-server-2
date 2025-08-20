import { PartialType } from '@nestjs/mapped-types';
import { CreateMaizeDto } from './create-maize.dto';

// Makes all fields from the create DTO optional for updates.
export class UpdateMaizeDto extends PartialType(CreateMaizeDto) {}
