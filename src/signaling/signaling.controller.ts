//#region imports
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';
import { CreateIceCandidateResponseDto } from './dto/create-ice-candidate-response.dto';
import { CreateIceCandidateDto } from './dto/create-ice-candidate.dto';
import { CreateSignalingChannelResponseDto } from './dto/create-signaling-channel-response.dto';
import { CreateSignalingChannelDto } from './dto/create-signaling-channel.dto';
import { DeleteSignalingChannelDto } from './dto/delete-signaling-channel.dto';
import { GetIceConfigDto } from './dto/get-ice-config.dto';
import { SignalingService } from './signaling.service';
//#endregion

@Controller({ path: 'signaling', version: '1' })
@ApiTags('signaling')
export class SignalingController {
  constructor(
    private signalingService: SignalingService,
    private logger: PinoLogger,
  ) {}

  @Post('session')
  @ApiResponse({
    status: 201,
  })
  @ApiOperation({
    description: 'the endpoint is used to set up a connection a the client',
  })
  async connect(@Body() connectionInfo) {
    this.logger.info(connectionInfo);
    return connectionInfo;
  }

  //#region SDP Exchange Endpoint
  @Post('sdp-offer')
  @ApiResponse({
    status: 201,
    type: CreateSignalingChannelResponseDto,
    description: 'SDP answer was created successfully',
  })
  @ApiOperation({
    description:
      'the endpoint is used to exchange SDP (session description protocol)',
  })
  async handleSdpOffer(
    @Body() createSignalingChannelDto: CreateSignalingChannelDto,
  ) {
    const { sessionId: sessionId, sdpOffer: sdpOffer } =
      createSignalingChannelDto;
    const sdpAnswer = await this.signalingService.processSdpOffer(
      sessionId,
      sdpOffer,
    );

    return new CreateSignalingChannelResponseDto({
      sdpAnswer: sdpAnswer,
      sessionId: sessionId,
    });
  }
  //#endregion

  //#region  Add ICE Candidate Endpoint
  @Post('ice-candidate')
  @ApiResponse({
    status: 201,
    description: 'ice was candidate added successfully',
  })
  @ApiOperation({
    description:
      'the endpoint is used to add ICE candidates gathered by the client',
  })
  async addIceCandidates(@Body() createIceCandidateDto: CreateIceCandidateDto) {
    const addedIceCandidate = await this.signalingService.addIceCandidate(
      createIceCandidateDto,
    );
    return addedIceCandidate;
  }
  //#endregion

  //#region get session endpoint
  @Get('stunner-info')
  @ApiResponse({
    status: 200,
    type: GetIceConfigDto,
  })
  @ApiOperation({
    description: 'the endpoint is used to return stunner info',
  })
  async getStunnerIceConfig() {
    const stunnerIceConfig = await this.signalingService.getStunnerIceConfig();
    return stunnerIceConfig;
  }
  //#endregion

  //#region Delete Session Endpoint
  @Delete('session')
  @ApiResponse({
    status: 200,
    description: 'session was destroyed successfully',
  })
  @ApiOperation({
    description:
      'the endpoint is used to destroy session resources i.e destroying the the media pipeline for the session',
  })
  async deleteSession(
    @Body() deleteSignalingChannelDto: DeleteSignalingChannelDto,
  ): Promise<string> {
    const deletedSessionId = await this.signalingService.deleteSession(
      deleteSignalingChannelDto.sessionId,
    );

    if (deletedSessionId === undefined) {
      throw new NotFoundException(
        `Session with Id: ${deleteSignalingChannelDto.sessionId} does not exist`,
      );
    }

    return deletedSessionId;
  }
  //#endregion
}
