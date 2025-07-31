import { Min, IsNumber } from 'class-validator';

export class UpdateDailyPriceDto {
  @IsNumber()
  @Min(0.01)
  price: number;
}
