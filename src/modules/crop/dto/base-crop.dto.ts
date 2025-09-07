import { IsOptional, IsObject, IsBoolean, IsString } from 'class-validator';

export class CropCustomFieldsDto {
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  otherVarietySelected?: boolean;

  @IsOptional()
  @IsString()
  otherVarietyName?: string;

  @IsOptional()
  @IsString()
  measure?: string;
}
