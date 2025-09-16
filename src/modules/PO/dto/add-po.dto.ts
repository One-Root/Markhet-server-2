// po-interest.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';

export class AddPOInterestDto {
  @IsString()
  @IsNotEmpty()
  poId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsDateString()
  @IsNotEmpty()
  commitDate: string;
}
