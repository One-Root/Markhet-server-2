import {
  IsEnum,
  IsUUID,
  IsArray,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

import { ChannelType } from '../../../common/enums/channel.enum';

import { CropName } from '../../../common/enums/farm.enum';

export class CreateChannelDto {
  @IsEnum(CropName)
  @IsNotEmpty()
  cropName: CropName;

  @IsUUID()
  @IsNotEmpty()
  cropId: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsArray()
  @IsUUID('all', { each: true })
  members: string[];

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
