import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { KakaoUserAfterAuth } from './util/decorator/user.decorator';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async findKakaoUser(user: KakaoUserAfterAuth) {
    return await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
  }

  async createKakaoUser(user: KakaoUserAfterAuth) {
    return await this.prisma.user.create({
      data: {
        email: user.email,
        nickname: user.nickname,
        snsId: user.snsId,
        provider: user.provider,
      },
    });
  }

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
}
