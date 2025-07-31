import { Entities } from '@one-root/markhet-core';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'local_db',
  entities: Entities,
  subscribers: [__dirname + '/../../**/*.subscriber.{js,ts}'],
  autoLoadEntities: true,
  synchronize: false,

  // 🔥 change this:
  ssl: false,
});
