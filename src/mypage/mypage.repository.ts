import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MypageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  //* 마이페이지 프로필 조회
  async getMypageProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        userId,
      },
      select: {
        email: true,
        nickname: true,
        image: true,
      },
    });

    return { data: user };
  }

  //* 마이페이지 프로필 유저 확인

  //* 마이페이지 프로필 업데이트
  async updateMypageProfile(userId: number, data: object) {
    await this.prisma.user.update({
      where: {
        userId,
      },
      data,
    });
  }
}
