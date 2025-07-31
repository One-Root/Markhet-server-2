import { Inject, Logger, Injectable } from '@nestjs/common';

import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async clear(): Promise<void> {
    await this.cacheManager.reset();
  }

  async clearByPrefix(prefix: string): Promise<void> {
    const keys = await this.cacheManager.store.keys();

    const matchingKeys = keys.filter((key: string) => key.startsWith(prefix));

    for (const key of matchingKeys) {
      await this.delete(key);
    }

    this.logger.log(`cleared cache keys with prefix '${prefix}'`);
  }
}
