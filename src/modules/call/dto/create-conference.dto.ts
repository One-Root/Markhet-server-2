import { IsString } from 'class-validator';

export class CreateConferenceDto {
  @IsString()
  conferenceName: string;
}
