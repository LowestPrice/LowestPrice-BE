import { Injectable } from '@nestjs/common';
import { MypageRepository } from './mypage.repository';

@Injectable()
export class MypageService {
  constructor(private readonly mypageRepository: MypageRepository) {}

  async getMypageProfile(userId: number) {
    return this.mypageRepository.getMypageProfile(userId);
  }
}
