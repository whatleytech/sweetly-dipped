import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Strip properties not in DTO (unknown properties removed silently)
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types (string to number, etc.)
      },
    })
  );

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
    credentials: true,
  });
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT) || 3001;

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 API server running on http://localhost:${port}`);
  logger.log(`📊 Health check: http://localhost:${port}/api/health`);
  logger.log(`📝 Forms API: http://localhost:${port}/api/forms`);
}

void bootstrap();

