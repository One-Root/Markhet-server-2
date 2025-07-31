import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Location } from '@one-root/markhet-core';

import { SeederService } from './seeder.service';
import { SeederCommand } from './seeder.command';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  providers: [SeederService, SeederCommand],
})
export class SeederModule {}
