import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MypageRepository {
  constructor(private readonly prisma: PrismaClient) {}

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
}
