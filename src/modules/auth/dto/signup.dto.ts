import {
  Length,
  IsEnum,
  IsArray,
  IsString,
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { CropName } from '../../../common/enums/farm.enum';
import {
  Language,
  Identity,
  PaymentMode,
} from '../../../common/enums/user.enum';

import { formatMobileNumber } from '../../../common/utils/format-mobile-number.util';
import { IsValidMobileNumber } from '../../../common/decorators/is-valid-mobile-number.decorator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  village: string;

  @IsValidMobileNumber()
  @Transform(({ value }) => formatMobileNumber(value))
  mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  taluk: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  pincode: string;

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

  @IsString()
  @IsOptional()
  profileImage: string;

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
