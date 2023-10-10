import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Magazine, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MagazineService {
  constructor(private readonly prisma: PrismaService) {}
  // Todo: 매거진 상세조회, 수정, 삭제 시 매거진 존재하는지 확인하는 로직 추가

  async create(data: Prisma.MagazineCreateInput): Promise<object> {
    try {
      const magazine: Magazine | null = await this.prisma.magazine.create({
        data,
      });

      return { message: '매거진 등록에 성공했습니다.' };
    } catch (err) {
      throw new HttpException(
        '서버 내부 에러가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(): Promise<object> {
    const magazines: Object[] | null = await this.prisma.magazine.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        magazineId: true,
        title: true,
        content: true,
        mainImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { data: magazines };
  }

  async findOne(id: number): Promise<object> {
    const magazine: Object | null = await this.prisma.magazine.findUnique({
      where: {
        magazineId: id,
      },
      select: {
        magazineId: true,
        title: true,
        content: true,
        mainImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { data: magazine };
  }

  async update(id: number, data: Prisma.MagazineUpdateInput): Promise<object> {
    const isExist: Object = await this.findOne(id);
    if (!isExist['data']) {
      throw new HttpException(
        '해당 매거진이 존재하지 않습니다.',
        HttpStatus.NOT_FOUND
      );
    }

    const magazine: Magazine | null = await this.prisma.magazine.update({
      where: {
        magazineId: id,
      },
      data: data,
    });
    return { message: '매거진 수정에 성공했습니다.' };
  }

  async remove(id: number): Promise<object> {
    const isExist: Object = await this.findOne(id);
    if (!isExist['data']) {
      throw new HttpException(
        '해당 매거진이 존재하지 않습니다.',
        HttpStatus.NOT_FOUND
      );
    }

    const magazine: Magazine | null = await this.prisma.magazine.delete({
      where: {
        magazineId: id,
      },
    });
    return { message: '매거진 삭제에 성공했습니다.' };
  }
}
