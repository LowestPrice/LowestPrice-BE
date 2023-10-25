import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { KakaoUserAfterAuth } from './util/decorator/user.decorator';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  //* jwt 로그인 확인
  async findUser(id: number) {
    return this.findUser(id);
  }

  //* 카카오 회원가입 유저 확인
  async findKakaoUser(snsId: string) {
    return this.authRepository.findKakaoUser(snsId);
  }

  //* 카카오 로그인 계정 생성
  async createKakaoUser(user: KakaoUserAfterAuth) {
    return this.authRepository.createKakaoUser(user);
  }

  //* refresh 토큰 저장
  saveRefresh(userId: number, refreshToken: string) {
    return this.authRepository.saveRefresh(userId, refreshToken);
  }

  //* 회원 탈퇴
  kakaoWithDrawal(userId: number) {
    this.authRepository.kakaoWithDrawal(userId);
    return {
      success: 'success',
      status: 200,
      message: '회원 탈퇴에 성공했습니다.',
    };
  }
}
