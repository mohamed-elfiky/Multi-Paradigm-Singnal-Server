import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { SignalingModule } from './signaling/signaling.module';

@Module({
  imports: [
    SignalingModule,
    LoggerModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['.env.develop'],
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
