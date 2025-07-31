import { IsEnum } from 'class-validator';

import { Folders } from '../../../common/enums/file.enum';

export class UploadFileDto {
  @IsEnum(Folders)
  folder: Folders;
}
