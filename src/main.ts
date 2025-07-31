import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { ValidationPipe } from './common/pipes/validation.pipe';

import { SeederCommand } from './modules/seeder/seeder.command';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      shouldTransform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: 'strict',
    }),
  );

  const command = app.get(SeederCommand);

  if (process.argv[2] === 'seed') {
    await command.run();

    process.exit(0);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
