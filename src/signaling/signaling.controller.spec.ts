import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { AppModule } from 'src/app.module';
import { CoreModule } from 'src/core/core.module';
import { KurentoClient } from 'src/core/kurento/kurento.client';
import { StunnerClient } from 'src/core/stunner/stunner.client';
import { CreateSignalingChannelResponseDto } from './dto/create-signaling-channel-response.dto';
import { GetIceConfigDto, IceServer } from './dto/get-ice-config.dto';
import { SignalingController } from './signaling.controller';
import { SignalingService } from './signaling.service';

describe('SignalingController', () => {
  let signalingController: SignalingController;
  let signalingService: SignalingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule, AppModule],
      providers: [SignalingService, KurentoClient, PinoLogger, StunnerClient],
      controllers: [SignalingController],
    }).compile();

    signalingController = module.get<SignalingController>(SignalingController);
    signalingService = module.get<SignalingService>(SignalingService);
  });

  it('should be defined', () => {
    expect(signalingController).toBeDefined();
  });

  describe('handleSdpOffer', () => {
    it('should return an sdpAnswer', async () => {
      const sdpAnswer = 'test';
      const sessionId = 'test';

      jest
        .spyOn(signalingService, 'processSdpOffer')
        .mockImplementation(() => Promise.resolve(sdpAnswer));

      expect(
        await signalingController.handleSdpOffer({
          sessionId: sessionId,
          sdpOffer: 'test',
        }),
      ).toStrictEqual(
        new CreateSignalingChannelResponseDto({
          id: 'startResponse',
          sdpAnswer: sdpAnswer,
          sessionId: sessionId,
        }),
      );
    });
  });

  describe('deleteSession', () => {
    it('should return deleted sessionId if a session exists', async () => {
      const sessionId = 'test';
      jest
        .spyOn(signalingService, 'deleteSession')
        .mockImplementation(() => Promise.resolve(sessionId));

      expect(await signalingService.deleteSession(sessionId)).toBe(sessionId);
    });

    it('throw not found exception if a session does not exist', async () => {
      jest
        .spyOn(signalingService, 'deleteSession')
        .mockImplementation(() => Promise.resolve(''));
      try {
        await signalingService.deleteSession('test');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('addIceCandidate', () => {
    it('should return the added ice candidate', async () => {
      const iceCandidate = {
        sessionId: 'test',
        candidate: {
          candidate:
            'candidate:2836907461 1 tcp 1518280447 172.17.0.1 9 typ host tcptype active generation 0 ufrag 0MN3 network-id 1',
          sdpMid: '1',
          sdpMLineIndex: 1,
        },
      };
      jest
        .spyOn(signalingService, 'addIceCandidate')
        .mockImplementation(() => Promise.resolve(iceCandidate));

      expect(
        await signalingController.addIceCandidates(iceCandidate),
      ).toStrictEqual(iceCandidate);
    });
  });

  describe('getStunnerIceInfo', () => {
    it('should return STUN server info', async () => {
      const stunnerIceConfig = new GetIceConfigDto({
        id: 'iceConfiguration',
        iceServers: [
          new IceServer({ url: 'test', username: 'test', credential: 'test' }),
        ],
        iceTransportPolicy: 'test',
      });
      jest
        .spyOn(signalingService, 'getStunnerIceConfig')
        .mockImplementation(() => Promise.resolve(stunnerIceConfig));

      expect(await signalingController.getStunnerIceConfig()).toStrictEqual(
        stunnerIceConfig,
      );
    });
  });
});
