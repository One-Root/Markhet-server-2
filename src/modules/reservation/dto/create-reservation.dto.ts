import {
  Min,
  IsEnum,
  IsUUID,
  IsString,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

import { CropName } from '../../../common/enums/farm.enum';

export class CreateReservationDto {
  @IsUUID()
  @IsNotEmpty()
  cropId: string;

  @IsEnum(CropName)
  @IsNotEmpty()
  cropName: CropName;

  @IsString()
  reservationDate: Date;

  @IsNumber()
  @Min(0.01)
  price: number;
}
