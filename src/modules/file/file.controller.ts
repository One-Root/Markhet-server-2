import {
  Post,
  Body,
  UseGuards,
  Controller,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FileService } from './file.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

import { UploadFileDto } from './dto/upload-file.dto';

@Controller('files')
@UseGuards(JwtAuthGuard, SessionGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<ApiResponse<{ url: string }>> {
    const url = await this.fileService.upload(file, uploadFileDto);

    return new ApiResponse(HttpStatus.CREATED, 'file uploaded successfully', {
      url,
    });
  }
}
