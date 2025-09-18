import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NewLocation } from '@one-root/markhet-core';
// import { Location } from '@one-root/markhet-core';
import { SeederService } from './seeder.service';
import { SeederCommand } from './seeder.command';

@Module({
  imports: [TypeOrmModule.forFeature([NewLocation])],
  providers: [SeederService, SeederCommand],
})
export class SeederModule {}
