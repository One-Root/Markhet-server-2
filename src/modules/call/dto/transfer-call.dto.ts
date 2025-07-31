import { IsUUID, IsArray, ArrayMinSize } from 'class-validator';

export class TransferCallDto {
  @IsUUID()
  callUUID: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  participantIds: string[];
}
