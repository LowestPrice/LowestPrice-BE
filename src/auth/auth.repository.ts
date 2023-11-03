import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { KakaoUserAfterAuth } from './util/decorator/user.decorator';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  //* jwt 로그인 확인
  async findUser(id: number) {
    return await this.prisma.user.findFirst({
      where: {
        userId: id,
      },
    });
  }

  //* 카카오 회원가입 유저 확인
  async findKakaoUser(snsId: string) {
    return await this.prisma.user.findFirst({
      where: {
        snsId: snsId,
      },
    });
  }

  //* 카카오 로그인 계정 생성
  async createKakaoUser(user: KakaoUserAfterAuth) {
    if (user.email != null) {
      return await this.prisma.user.create({
        data: {
          email: user.email,
          nickname: user.nickname,
          snsId: user.snsId,
          provider: user.provider,
          image: user.image,
        },
      });
    }

    return await this.prisma.user.create({
      data: {
        nickname: user.nickname,
        snsId: user.snsId,
        provider: user.provider,
        image: user.image,
      },
    });
  }

  //* refresh 토큰 저장
  async saveRefresh(userId: number, refreshToken: string) {
    return await this.prisma.user.update({
      where: {
        userId: userId,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
  }

  //* 사용자의 refresh 토큰 조회
  async findRefresh(userId: number) {
    return await this.prisma.user.findFirst({
      where: {
        userId: userId,
      },
      select: {
        refreshToken: true,
      },
    });
  }

  //* 회원탈퇴
  async kakaoDeactivate(userId: number) {
    return await this.prisma.user.delete({
      where: {
        userId: userId,
      },
    });
  }

  //* 로그아웃
  async deleteRefreshToken(userId: number) {
    return await this.prisma.user.update({
      where: {
        userId: userId,
      },
      data: {
        refreshToken: null,
      },
    });
  }
}
