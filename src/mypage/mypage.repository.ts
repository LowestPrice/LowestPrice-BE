import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateMypageDTO } from './dto/update.mypage.dto';

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
        nickname: true,
        image: true,
      },
    });

    return { data: user };
  }

  //* 마이페이지 프로필 업데이트
  async updateMypageProfile(userId: number, updateMypageDTO: UpdateMypageDTO) {
    const user = await this.prisma.user.update({
      where: {
        userId: userId,
      },
      data: {
        nickname: updateMypageDTO.nickname,
        image: updateMypageDTO.image,
      },
    });

    console.log(user);

    return { data: user };
  }
}
