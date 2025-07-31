import { IsString, IsNotEmpty, IsPostalCode } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  village: string;

  @IsString()
  @IsNotEmpty()
  officeName: string;

  @IsPostalCode('IN')
  pincode: string;

  @IsString()
  @IsNotEmpty()
  taluk: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}
