import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useWebSocketAdapter(new WsAdapter(app));

  app.useLogger(app.get(Logger));

  app.enableCors();

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle('WebRTC Signal Server')
    .setDescription(
      'A WebRTC signaling server to handle client to media server exchange of configuration',
    )
    .setVersion('1.0.0')
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      displayOperationId: true,
    },
  });

  await app.listen(parseInt(process.env.APP_PORT!) || 3000);
}
bootstrap();
