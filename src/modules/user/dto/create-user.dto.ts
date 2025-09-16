import { Transform } from 'class-transformer';
import {
  IsEnum,
  Length,
  IsArray,
  IsString,
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
} from 'class-validator';

import { CropName } from '../../../common/enums/farm.enum';
import {
  Language,
  Identity,
  PaymentMode,
} from '../../../common/enums/user.enum';

import { formatMobileNumber } from '../../../common/utils/format-mobile-number.util';
import { IsValidMobileNumber } from '../../../common/decorators/is-valid-mobile-number.decorator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  village: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  mobileNumber: string;

  @IsNotEmpty()
  latitude: number;

  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsOptional()
  taluk: string;

  @IsString()
  @IsOptional()
  district: string;

  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  @IsOptional()
  @Length(6, 6)
  pincode: string;

  @IsOptional()
  @IsString()
  profileImage: string;

  @IsEnum(Language)
  language: Language;

  @IsEnum(Identity)
  identity: Identity;

  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsArray()
  @IsEnum(CropName, { each: true })
  @ArrayNotEmpty()
  cropNames: CropName[];

  @IsArray()
  @IsEnum(PaymentMode, { each: true })
  @IsOptional()
  preferredPaymentModes: PaymentMode[];

  @IsArray()
  @IsEnum(Language, { each: true })
  @IsOptional()
  knownLanguages: Language[];
}
