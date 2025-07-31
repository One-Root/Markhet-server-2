import * as path from 'path';

import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';

import { ConfigModule } from '@nestjs/config';

import { SeederModule } from './modules/seeder/seeder.module';

import { JwtConfigModule } from './config/jwt/jwt-config.module';
import { DatabaseConfigModule } from './config/database/database-config.module';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FarmModule } from './modules/farm/farm.module';
import { FileModule } from './modules/file/file.module';
import { CallModule } from './modules/call/call.module';
import { CropModule } from './modules/crop/crop.module';
import { EventModule } from './modules/event/event.module';
import { MarketModule } from './modules/market/market.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { ChannelModule } from './modules/channel/channel.module';
import { SessionModule } from './modules/session/session.module';
import { LocationModule } from './modules/location/location.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { DailyPriceModule } from './modules/daily-price/daily-price.module';
import { TranslationModule } from './modules/translation/translation.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { MarketPriceModule } from './modules/market-price/market-price.module';
import { HarvestHistoryModule } from './modules/harvest-history/harvest-history.module';
import { PriorityConfigModule } from './modules/priority-config/priority-config.module';
import { NotificationTemplateModule } from './modules/notification-template/notification-template.module';

import { AppController } from './app.controller';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

      envFilePath: path.resolve(
        __dirname,
        `../.env.${process.env.NODE_ENV || 'development'}`,
      ),
    }),

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD || 'password',
      },
    }),

    FileModule,
    EventModule,
    SeederModule,
    SchedulerModule,

    AuthModule,
    UserModule,
    FarmModule,
    CropModule,
    CallModule,
    MarketModule,
    TicketModule,
    ChannelModule,
    SessionModule,
    LocationModule,
    DailyPriceModule,
    TranslationModule,
    ReservationModule,
    MarketPriceModule,
    HarvestHistoryModule,
    PriorityConfigModule,
    NotificationTemplateModule,

    JwtConfigModule,
    DatabaseConfigModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
