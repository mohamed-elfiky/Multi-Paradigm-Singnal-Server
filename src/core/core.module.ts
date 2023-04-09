import { Module } from '@nestjs/common';
import { KurentoClient } from './kurento/kurento.client';
import { StunnerClient } from './stunner/stunner.client';

@Module({
  providers: [KurentoClient, StunnerClient],
})
export class CoreModule {}
