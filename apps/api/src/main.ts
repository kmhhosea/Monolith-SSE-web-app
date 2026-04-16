import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ensureUploadDir } from './common/utils/upload-path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
  const httpAdapter = app.getHttpAdapter().getInstance();

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.WEB_URL ?? 'http://localhost:3000',
    credentials: true
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SSE Academic Collaboration Platform API')
    .setDescription('Production-ready monolith API for the SSE academic community')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(process.env.SWAGGER_PATH ?? 'docs', app, document);

  httpAdapter.get('/', (_request: unknown, response: { status: (code: number) => { json: (body: unknown) => void } }) => {
    response.status(200).json({
      status: 'ok',
      service: 'sse-api',
      timestamp: new Date().toISOString()
    });
  });

  httpAdapter.get('/health', (_request: unknown, response: { status: (code: number) => { json: (body: unknown) => void } }) => {
    response.status(200).json({
      status: 'ok',
      service: 'sse-api',
      timestamp: new Date().toISOString()
    });
  });

  ensureUploadDir();

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
