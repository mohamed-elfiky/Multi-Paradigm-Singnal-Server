import { ApiProperty } from '@nestjs/swagger';

export class IceServer {
  constructor(init: IceServer) {
    Object.assign(this, init);
  }
  @ApiProperty()
  url!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  credential!: string;
}

export class GetIceConfigDto {
  constructor(init: GetIceConfigDto) {
    Object.assign(this, init);
  }

  @ApiProperty({ default: 'iceConfigure' })
  id: string = 'iceConfiguration';

  @ApiProperty()
  iceServers!: IceServer[];

  @ApiProperty()
  iceTransportPolicy!: string;
}
