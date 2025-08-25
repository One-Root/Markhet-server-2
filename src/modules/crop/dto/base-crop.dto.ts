import { IsOptional, IsObject } from 'class-validator';

export class CropCustomFieldsDto {
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}
