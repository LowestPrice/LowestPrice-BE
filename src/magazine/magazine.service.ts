import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Magazine, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MagazineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MagazineCreateInput) {
    try {
      const magazine: Magazine | null = await this.prisma.magazine.create({
        data,
      });
      if (magazine) {
        return { message: '매거진 등록에 성공했습니다.' };
      }
    } catch (err) {
      throw new HttpException(
        '서버 내부 에러가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll() {
    const magazines: Magazine[] | null = await this.prisma.magazine.findMany();
    //? res 할 때 편하게 반환 할 수 있는 형식? 이후에 수정
    return magazines;
  }

  async findOne(id: number) {
    const magazine: Magazine | null = await this.prisma.magazine.findUnique({
      where: {
        magazineId: id,
      },
    });
    return magazine;
  }

  async update(id: number, data: Prisma.MagazineUpdateInput) {
    const magazine: Magazine | null = await this.prisma.magazine.update({
      where: {
        magazineId: id,
      },
      data: data,
    });
    return magazine;
  }

  async remove(id: number) {
    const magazine: Magazine | null = await this.prisma.magazine.delete({
      where: {
        magazineId: id,
      },
    });
    return magazine;
  }
}
