import { Module } from '@nestjs/common';
import { SignalingService } from './signaling.service';
import { SignalingController } from './signaling.controller';
import { CoreModule } from 'src/core/core.module';
import { KurentoClient } from 'src/core/kurento/kurento.client';
import { StunnerClient } from 'src/core/stunner/stunner.client';
import { SignalingGateway } from './signaling.gateway';

@Module({
  imports: [CoreModule],
  providers: [SignalingService, KurentoClient, StunnerClient, SignalingGateway],
  controllers: [SignalingController],
})
export class SignalingModule {}
