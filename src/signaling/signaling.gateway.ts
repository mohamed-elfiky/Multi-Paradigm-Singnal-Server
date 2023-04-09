import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { PinoLogger } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';

import { Server } from 'ws';
import { CreateIceCandidateResponseDto } from './dto/create-ice-candidate-response.dto';
import { CreateSignalingChannelResponseDto } from './dto/create-signaling-channel-response.dto';
import { CreateSignalingChannelDto } from './dto/create-signaling-channel.dto';
import { SignalingService } from './signaling.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SignalingGateway {
  constructor(
    private signalingService: SignalingService,
    private logger: PinoLogger,
  ) {
    this.logger.setContext(SignalingGateway.name);
  }

  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('sdpOffer')
  async onSdpOffer(
    client: any,
    data: any,
  ): Promise<CreateSignalingChannelResponseDto> {
    const { sessionId, sdpOffer } = data;

    this.logger.info(`got sdp-offer from client with id: ${sessionId}`);

    const sdpAnswer = await this.signalingService.processSdpOffer(
      sessionId,
      sdpOffer,
      client,
    );

    return new CreateSignalingChannelResponseDto({
      sdpAnswer: sdpAnswer,
      sessionId: sessionId,
    });
  }

  @SubscribeMessage('iceCandidate')
  async onIceCandidate(client: any, data: any): Promise<void> {
    const { sessionId, candidate } = data;
    this.signalingService.addIceCandidate({ sessionId, candidate });
  }

  @SubscribeMessage('stop')
  async onStop(client: any, data: any): Promise<void> {
    const { sessionId } = data;
    this.logger.info(`request to stop session with id: ${sessionId}`);
    this.signalingService.deleteSession(sessionId);
  }

  @SubscribeMessage('connectionId')
  async onConnectionId(client: any, data: any): Promise<any> {
    this.logger.info(`got a request for session id`);
    return { connectionId: uuidv4(), id: 'connectionId' };
  }
}
