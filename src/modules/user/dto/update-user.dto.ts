import { Type, Transform } from 'class-transformer';
import {
  IsEnum,
  Length,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';

import { CropName } from '../../../common/enums/farm.enum';
import { MetaDataDto } from '../../../common/dto/meta-data.dto';
import { Language, Identity } from '../../../common/enums/user.enum';

import { formatMobileNumber } from '../../../common/utils/format-mobile-number.util';
import { IsValidMobileNumber } from '../../../common/decorators/is-valid-mobile-number.decorator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsString()
  @IsOptional()
  taluk?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @Length(6, 6)
  @IsOptional()
  pincode?: string; // ✅ optional

  @IsOptional()
  @IsString()
  profileImage?: string; // ✅ already optional

  @IsValidMobileNumber()
  @IsOptional()
  @Transform(({ value }) => formatMobileNumber(value))
  mobileNumber?: string;

  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @IsEnum(Identity)
  @IsOptional()
  identity?: Identity;

  @IsArray()
  @IsEnum(CropName, { each: true })
  @IsOptional()
  cropNames?: CropName[]; // ✅ optional

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaDataDto)
  @IsOptional()
  meta?: { key: string; value: any }[]; // ✅ optional
}
