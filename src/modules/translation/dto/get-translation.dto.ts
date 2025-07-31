import { Length, IsString, IsNotEmpty } from 'class-validator';

export class GetTranslationDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  text: string;
}
