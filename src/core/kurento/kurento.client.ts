import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import kurento, { getComplexType, getSingleton } from 'kurento-client';
import axios from 'axios';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { TextEncoder } from 'util';
import { PinoLogger } from 'nestjs-pino';

@Injectable({ scope: Scope.DEFAULT })
export class KurentoClient {
  private kurentoWebsocketUrl = process.env.KURENTO_WS_URI!;
  private sessions = {};
  private iceCandidateQueue = {};

  private region = process.env.AWS_GATEWAY_REGION!;
  private apiGatewayId = process.env.AWS_GATEWAY_ID!;
  private stage = process.env.AWS_GATEWAY_STAGE!;

  private accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
  private secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

  private client = new ApiGatewayManagementApiClient({
    region: this.region,
    endpoint: `https://${this.apiGatewayId}.execute-api.${this.region}.amazonaws.com/${this.stage}/`,
    credentials: {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    },
  });

  constructor(private logger: PinoLogger) {
    this.logger.setContext(KurentoClient.name);
  }

  public async createMediaPipeline(
    sessionId: string,
    sdpOffer: string,
    client?: any,
  ) {
    const kurentoClient = await getSingleton(this.kurentoWebsocketUrl!);
    const kurentoMediaPipeline = await kurentoClient.create('MediaPipeline');

    try {
      const webRtcEndpoint = await kurentoMediaPipeline.create(
        'WebRtcEndpoint',
      );

      await this.addIceCandidatesToEndpoint(sessionId, webRtcEndpoint);

      webRtcEndpoint.on('OnIceCandidate', (event) => {
        const candidate = getComplexType('IceCandidate')(event.candidate);
        if (client) {
          client.send(
            JSON.stringify({ candidate: candidate, id: 'iceCandidate' }),
          );
        } else {
          this.sendLocalIceCandidate(sessionId, candidate);
        }
      });

      await webRtcEndpoint.connect(webRtcEndpoint);

      const sdpAnswer = await webRtcEndpoint.processOffer(sdpOffer);

      await this.attachPipelineToSession(
        sessionId,
        webRtcEndpoint,
        kurentoMediaPipeline,
      );

      await webRtcEndpoint.gatherCandidates();

      return sdpAnswer;
    } catch (e) {
      this.logger.error(e);
      kurentoMediaPipeline.release();
    }
    return undefined;
  }

  public async addIceCandidates(
    sessionId: string,
    clientCandidate: kurento.IceCandidate,
  ) {
    const candidate = getComplexType('IceCandidate')(clientCandidate);

    if (this.sessions[sessionId]) {
      this.logger.info('Sending candidate');

      const webRtcEndpoint = this.sessions[sessionId].webRtcEndpoint;

      webRtcEndpoint.addIceCandidate(candidate);
    } else {
      this.logger.info('Queueing candidate');

      if (!this.iceCandidateQueue[sessionId]) {
        this.iceCandidateQueue[sessionId] = [];
      }

      this.iceCandidateQueue[sessionId].push(candidate);
    }
    return { sessionId: sessionId, candidate: clientCandidate };
  }

  public async deleteSession(sessionId: string) {
    if (this.sessions[sessionId]) {
      const pipeline = this.sessions[sessionId].pipeline;

      this.logger.info('Releasing pipeline');

      pipeline.release();

      delete this.sessions[sessionId];
      delete this.iceCandidateQueue[sessionId];

      return sessionId;
    }

    return undefined;
  }

  private async attachPipelineToSession(
    sessionId: string,
    webRtcEndpoint: kurento.WebRtcEndpoint,
    pipeline: kurento.MediaPipeline,
  ) {
    this.sessions[sessionId] = {
      pipeline: pipeline,
      webRtcEndpoint: webRtcEndpoint,
    };
  }

  private async addIceCandidatesToEndpoint(
    sessionId: string,
    webRtcEndpoint: kurento.WebRtcEndpoint,
  ) {
    if (this.iceCandidateQueue[sessionId]) {
      while (this.iceCandidateQueue[sessionId].length) {
        const candidate = this.iceCandidateQueue[sessionId].shift();

        webRtcEndpoint.addIceCandidate(candidate);
      }
    }
  }

  private async sendLocalIceCandidate(sessionId: string, candidate: any) {
    try {
      const message = {
        ConnectionId: sessionId,
        Data: new TextEncoder().encode(
          JSON.stringify({
            id: 'iceCandidate',
            candidate: candidate,
          }),
        ),
      };

      const command = new PostToConnectionCommand(message);
      await this.client.send(command);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
