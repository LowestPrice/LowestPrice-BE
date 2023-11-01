import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // CORS 설정
  app.enableCors({
    origin: [
      'https://lowest-price.vercel.app',
      'http://localhost:5173',
      'https://lowest-price.store',
    ],
    credentials: true,
    exposedHeaders: ['Authorization', 'refreshToken'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // cookie parser 미들웨어 추가
  // app.use(cookieParser(process.env.COOKIE_SECRET));

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableShutdownHooks();
  //예외처리 필터 마지막에 추가
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT, () => {
    console.log(`NestJS application is running on port ${process.env.PORT}`);
  });
}
bootstrap();
