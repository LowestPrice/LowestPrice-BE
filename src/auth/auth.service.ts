import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { KakaoUserAfterAuth } from './util/decorator/user.decorator';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authRepository: AuthRepository
  ) {}

  async findUser(id: number) {
    return await this.prisma.user.findFirst({
      where: {
        userId: id,
      },
    });
  }

  async findKakaoUser(snsId: string) {
    return await this.prisma.user.findFirst({
      where: {
        snsId: snsId,
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
        image: user.image,
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

  async kakaoWithDrawal(userId: number) {}
}
