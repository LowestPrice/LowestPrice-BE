import { Injectable } from '@nestjs/common';
import { MypageRepository } from './mypage.repository';
import { updateMypageDTO } from './dto/update.mypage.dto';

@Injectable()
export class MypageService {
  constructor(private readonly mypageRepository: MypageRepository) {}

  async getMypageProfile(userId: number) {
    return this.mypageRepository.getMypageProfile(userId);
  }

  async updateMypageProfile(
    userId: number,
    file: Express.Multer.File,
    data: updateMypageDTO
  ) {
    await this.mypageRepository.updateMypageProfile(userId, data);
    return { message: '프로필 수정에 성공했습니다.' };
  }
}
