import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create.user.dto.ts';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async signUp(createUserDto: CreateUserDto): Promise<object> {
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        nickname: createUserDto.nickname,
        // 아래 두 필드는 기본값으로 설정함
        snsId: 'defaultId',
        provider: 'defaultProvider',
      },
    });
    return user;
  }

  async login(email: string): Promise<object> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }
}
