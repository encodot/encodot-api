import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as config from 'config';
import { AppModule } from './app.module';
import { ApiLogger } from './logger/api-logger';

const port = config.get<number>('port');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: new ApiLogger()
  });

  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle('Encodot swagger')
    .setDescription('Documentation of the encodot api')
    .setVersion('1.0')
    .addTag('encodot')
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    deepScanRoutes: true
  });
  SwaggerModule.setup('api/swagger', app, document);

  await app.listen(port);
}
bootstrap();
