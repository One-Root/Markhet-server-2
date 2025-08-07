import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CropCardController } from './crop-card.controller';
import { CropCardService } from './crop-card.service';

import { CropCard } from '@one-root/markhet-core';
import { User } from '@one-root/markhet-core';

import { CropModule } from '../crop/crop.module';
import { CacheModule } from '../cache/cache.module';
import { SessionModule } from '../session/session.module';
import { SessionGuard } from '../session/guards/session.guard';
import { UserModule } from '../user/user.module';
import { CropCardInterest } from '@one-root/markhet-core';

@Module({
  imports: [
    TypeOrmModule.forFeature([CropCard, User, CropCardInterest]),
    CropModule,
    CacheModule,
    SessionModule,
    UserModule,
  ],
  controllers: [CropCardController],
  providers: [CropCardService, SessionGuard],
  exports: [CropCardService],
})
export class CropCardModule {}
