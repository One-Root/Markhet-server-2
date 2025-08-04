import * as multer from 'multer';

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { FileService } from './file.service';
import { FileController } from './file.controller';

import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),

    SessionModule,
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
