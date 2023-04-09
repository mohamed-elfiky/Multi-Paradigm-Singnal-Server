import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSignalingChannelDto {
  @ApiProperty()
  @IsString()
  sdpOffer!: string;

  @ApiProperty()
  @IsString()
  sessionId!: string;
}
