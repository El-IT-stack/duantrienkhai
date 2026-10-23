import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // 1. Cấu hình Global Prefix: /api
  app.setGlobalPrefix('api');

  // 2. Cấu hình CORS
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Validation Pipe toàn cục (Kiểm tra dữ liệu đầu vào DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. Bộ lọc lỗi toàn cục (Ngăn rò rỉ stack trace)
  app.useGlobalFilters(new AllExceptionsFilter());

  // 5. Interceptor ghi log request toàn cục
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 6. Cấu hình Swagger OpenAPI UI tại /api/docs
  const config = new DocumentBuilder()
    .setTitle('Hệ thống Quản lý Dự án API (Project Management)')
    .setDescription(
      'Tài liệu đặc tả toàn bộ REST API cho Đề tài 14 - Môn Triển khai và Quản trị Hệ thống Phần mềm.\n' +
      'Bao gồm Authentication, Users, Projects, Tasks (Kanban), Dashboard thống kê, Health check và Prometheus metrics.'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Project Management API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 7. Lắng nghe cổng
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`================================================================`);
  logger.log(`🚀 Backend NestJS is running on: http://0.0.0.0:${port}/api`);
  logger.log(`📖 Swagger API Documentation : http://localhost:${port}/api/docs`);
  logger.log(`🩺 Health check endpoint     : http://localhost:${port}/api/health`);
  logger.log(`📊 Prometheus Metrics        : http://localhost:${port}/api/metrics`);
  logger.log(`================================================================`);
}

bootstrap();
