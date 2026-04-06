import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { HttpValidationPipe } from './common/pipes/http-validation.pipe';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable dependency injection in class-validator constraints
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new HttpValidationPipe());
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Clinic API')
    .setVersion('0.1.0')
    .setDescription('Klinikani boshqarish tizimi API dokumentatsiyasi')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description: 'JWT token kiriting (misol: Bearer eyJhbGciOiJIUzI1NiIs...)',
      },
      'bearer', // Barcha kontrollerlardagi @ApiBearerAuth() bilan mos ishlashi uchun
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Sahifa yangilanganda token saqlanadi
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📖 Swagger documentation: http://localhost:${port}/docs`);
}
bootstrap();
