import { IsEnum } from 'class-validator';

import { ReservationStatus } from '../../../common/enums/reservation.enum';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
