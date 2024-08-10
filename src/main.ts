import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { transformQueryParamMiddleware } from './shared/middlewares/transform-query-param.middleware';
import { TransformBodyParamInterceptor } from './shared/interceptors/transform-body-param.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['*'],
      credentials: true,
    },
  });

  app.setGlobalPrefix('/api');

  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(transformQueryParamMiddleware);

  app.useGlobalInterceptors(new TransformBodyParamInterceptor());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
