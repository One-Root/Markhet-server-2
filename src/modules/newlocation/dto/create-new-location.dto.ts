import { IsString, IsNotEmpty, IsPostalCode } from 'class-validator';

export class CreateNewLocationDto {
  @IsString()
  @IsNotEmpty()
  village: string;

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
