import { PickType } from '@nestjs/swagger';
import { MypageEntity } from '../entities/mypage.entity';

export class UpdateMypageDTO extends PickType(MypageEntity, [
  'nickname',
  'image',
]) {}

// export class UpdateMypageDTO {
//   nickname?: string;
//   image?: string;
// }
