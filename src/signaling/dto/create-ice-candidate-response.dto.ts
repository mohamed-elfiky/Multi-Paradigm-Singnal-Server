import { PartialType } from '@nestjs/swagger';
import { CreateIceCandidateDto } from './create-ice-candidate.dto';

export class CreateIceCandidateResponseDto extends PartialType(
  CreateIceCandidateDto,
) {
  constructor(target: any) {
    super();
    Object.assign(this, target);
  }
}
