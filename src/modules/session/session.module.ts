import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Session } from '@one-root/markhet-core';

import { SessionService } from './session.service';

import { JwtConfigModule } from '../../config/jwt/jwt-config.module';

@Module({
  imports: [JwtConfigModule, TypeOrmModule.forFeature([Session])],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
