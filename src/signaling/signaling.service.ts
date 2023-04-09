import { Injectable } from '@nestjs/common';
import { KurentoClient } from 'src/core/kurento/kurento.client';
import { StunnerClient } from 'src/core/stunner/stunner.client';
import { CreateIceCandidateDto } from './dto/create-ice-candidate.dto';
import { GetIceConfigDto } from './dto/get-ice-config.dto';

@Injectable()
export class SignalingService {
  constructor(
    private kurentoClient: KurentoClient,
    private stunnerClient: StunnerClient,
  ) {}

  public async processSdpOffer(
    sessionId: string,
    sdpOffer: string,
    client?: any,
  ) {
    const sdpAnswer = await this.kurentoClient.createMediaPipeline(
      sessionId,
      sdpOffer,
      client,
    );
    return sdpAnswer;
  }

  public async addIceCandidate(iceCandidateDto: CreateIceCandidateDto) {
    const { sessionId, candidate } = iceCandidateDto;
    const addedIceCandidate = await this.kurentoClient.addIceCandidates(
      sessionId,
      candidate,
    );
    return addedIceCandidate;
  }

  public async deleteSession(sessionId: string) {
    const deletedSessionId = await this.kurentoClient.deleteSession(sessionId);
    return deletedSessionId;
  }

  public async getStunnerIceConfig() {
    const stunnerIceConfig = await this.stunnerClient.getStunnerIceConfig();
    return new GetIceConfigDto(stunnerIceConfig);
  }
}
