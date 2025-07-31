import { Module } from '@nestjs/common';

import { TranslationService } from './translation.service';
import { TranslationController } from './translation.controller';

import { SessionModule } from '../session/session.module';

@Module({
  imports: [SessionModule],
  providers: [TranslationService],
  controllers: [TranslationController],
  exports: [TranslationService],
})
export class TranslationModule {}
