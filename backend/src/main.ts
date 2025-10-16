import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3000',
      'https://cmms-frontend-1zzz.onrender.com',
      /\.onrender\.com$/  // Allow all Render domains
    ],
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  const isProduction = process.env.NODE_ENV === 'production';
  const host = isProduction ? '0.0.0.0' : 'localhost';
  console.log(`🚀 Application is running on: http://${host}:${port}/api`);
}
bootstrap();
