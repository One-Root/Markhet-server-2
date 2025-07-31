import { Logger, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';

import {
  Connection,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  EntitySubscriberInterface,
} from 'typeorm';

import { Crop } from '@one-root/markhet-core';

import { CacheService } from '../../cache/cache.service';

@Injectable()
export class CropEntitySubscriber implements EntitySubscriberInterface<Crop> {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @InjectConnection() readonly connection: Connection,

    private readonly cacheService: CacheService,
  ) {
    connection.subscribers.push(this);
  }

  listenTo(): Function | string {
    return Crop;
  }

  async afterInsert(event: InsertEvent<Crop>): Promise<void> {
    this.logger.log(`insert event detected for '${event.metadata.name}'`);

    await this.cacheService.clearByPrefix(`crops:${event.metadata.name}:`);
  }

  async afterUpdate(event: UpdateEvent<Crop>): Promise<void> {
    this.logger.log(`update event detected for '${event.metadata.name}'`);

    await this.cacheService.clearByPrefix(`crops:${event.metadata.name}:`);
  }

  async afterRemove(event: RemoveEvent<Crop>): Promise<void> {
    this.logger.log(`remove event detected for '${event.metadata.name}'`);

    await this.cacheService.clearByPrefix(`crops:${event.metadata.name}:`);
  }
}
