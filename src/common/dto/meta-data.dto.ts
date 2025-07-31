import { IsString, IsDefined } from 'class-validator';

class MetaDataDto {
  @IsString()
  key: string;

  @IsDefined()
  value: any;
}

export { MetaDataDto };
