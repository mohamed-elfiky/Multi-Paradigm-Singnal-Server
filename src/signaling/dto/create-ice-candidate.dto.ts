import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import kurento from 'kurento-client';

export class CreateIceCandidateDto {
  @ApiProperty()
  candidate!: kurento.IceCandidate;

  @ApiProperty()
  @IsString()
  sessionId!: string;
}
