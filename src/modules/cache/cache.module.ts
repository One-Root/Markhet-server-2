import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.register({
      ttl: parseInt(process.env.CACHE_TTL, 10) || 86400,
      max: parseInt(process.env.CACHE_MAX, 10) || 50,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
