import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import * as auth from '@l7mp/stunner-auth-lib';

@Injectable()
export class StunnerClient {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(StunnerClient.name);
  }

  onModuleInit() {
    try {
      this.logger.info(
        `Stunner Client started, getting config file from ${process.env.STUNNER_CONFIG_FILENAME}`,
      );

      const iceConfig = auth.getIceConfig({
        config_file: process.env.STUNNER_CONFIG_FILENAME!,
      });

      this.logger.info(`ice config: ${iceConfig}`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  public async getStunnerIceConfig() {
    const stunnerInfo = auth.getIceConfig({
      config_file: process.env.STUNNER_CONFIG_FILENAME!,
    });

    this.logger.info(`ice config: ${stunnerInfo}`);

    return stunnerInfo;
  }
}
