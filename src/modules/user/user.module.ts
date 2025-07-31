import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@one-root/markhet-core';

import { UserService } from './user.service';
import { UserController } from './user.controller';

import { SessionModule } from '../session/session.module';

import { GetStreamService } from '../../services/get-stream.service';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), SessionModule, LocationModule],
  controllers: [UserController],
  providers: [UserService, GetStreamService],
  exports: [UserService],
})
export class UserModule {}
