import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Channel } from '@one-root/markhet-core';

import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';

import { UserModule } from '../user/user.module';
import { CropModule } from '../crop/crop.module';

@Module({
  imports: [TypeOrmModule.forFeature([Channel]), CropModule, UserModule],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
