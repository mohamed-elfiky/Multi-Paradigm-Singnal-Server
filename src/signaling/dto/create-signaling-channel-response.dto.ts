import { ApiProperty } from '@nestjs/swagger';
import { CreateSignalingChannelDto } from './create-signaling-channel.dto';

export class CreateSignalingChannelResponseDto {
  constructor(target: any) {
    Object.assign(this, target);
  }

  @ApiProperty({ default: 'startResponse' })
  id = 'startResponse';

  @ApiProperty()
  sdpAnswer!: string;

  @ApiProperty()
  sessionId!: string;
}
