import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeDatabase } from './init-db';

async function bootstrap() {
  // Initialize database schema if using SQLite Cloud
  await initializeDatabase();

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

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
