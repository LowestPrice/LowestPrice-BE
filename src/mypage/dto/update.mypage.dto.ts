import { PickType } from '@nestjs/swagger';
import { MypageEntity } from '../entities/mypage.entity';

export class updateMypageDTO extends PickType(MypageEntity, [
  'email',
  'nickname',
  'image',
]) {}
