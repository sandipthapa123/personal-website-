import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/backend/.env') });

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(path.resolve(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api/v1', {
    exclude: [
      'admin',
      'admin/(.*)',
      'sitemap.xml',
      'news-sitemap.xml',
      'image-sitemap.xml',
      'video-sitemap.xml',
      'robots.txt',
      'rss.xml',
      'atom.xml',
      'feed.json',
    ],
  });

  const config = new DocumentBuilder()
    .setTitle('thapasandip.com.np Engine CMS API')
    .setDescription('Enterprise Platform-Driven Multi-Tenant Backend-Driven CMS API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 CMS API Server running on http://localhost:${port}/api/v1`);
  console.log(`🔑 Backend Admin Portal running on http://localhost:${port}/admin/login`);
  console.log(`📚 OpenAPI Docs available on http://localhost:${port}/api/docs`);
}

bootstrap();
