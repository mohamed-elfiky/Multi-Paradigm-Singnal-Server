import { Test, TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { AppModule } from 'src/app.module';
import { CoreModule } from 'src/core/core.module';
import { KurentoClient } from 'src/core/kurento/kurento.client';
import { StunnerClient } from 'src/core/stunner/stunner.client';
import { SignalingService } from './signaling.service';

describe('SignalingService', () => {
  let service: SignalingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule, AppModule],
      providers: [SignalingService, KurentoClient, StunnerClient, PinoLogger],
    }).compile();

    service = module.get<SignalingService>(SignalingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
