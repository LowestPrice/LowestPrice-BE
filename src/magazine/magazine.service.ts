import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LikeMagazine, Magazine, Prisma } from '@prisma/client';
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
        _count: {
          select: {
            LikeMagazine: true,
          },
        },
      },
    });

    const parseLikeMagazines: object[] =
      this.parseLikeMagazinesModel(magazines);

    return { data: parseLikeMagazines };
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
        _count: {
          select: {
            LikeMagazine: true,
          },
        },
      },
    });

    const parseLikeMagazine: object = this.parseLikeMagazineModel(magazine);
    return { data: parseLikeMagazine };
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

  async setLike(magazineId: number, userId: number): Promise<object> {
    //* 0. 매거진 존재 여부 확인
    const isExist: Object = await this.findOne(magazineId);
    if (!isExist['data']) {
      throw new HttpException(
        '해당 매거진이 존재하지 않습니다.',
        HttpStatus.NOT_FOUND
      );
    }

    //* 1. '좋아요' 여부 확인
    const isLike: LikeMagazine | null =
      await this.prisma.likeMagazine.findFirst({
        where: {
          MagazineId: magazineId,
          UserId: userId,
        },
      });

    //* 1-1. '좋아요' 안 했으면 좋아요 등록
    if (!isLike) {
      await this.prisma.likeMagazine.create({
        data: {
          MagazineId: magazineId,
          UserId: userId,
        },
      });

      return { message: '매거진 좋아요 등록에 성공했습니다.' };
    }

    //* 1-2. '좋아요' 했으면 좋아요 취소
    await this.prisma.likeMagazine.delete({
      where: {
        likeMagazineId: isLike.likeMagazineId,
      },
    });

    return { message: '매거진 좋아요 취소에 성공했습니다.' };
  }

  async getLikes(userId: number): Promise<object> {
    const LikeMagazines: Object[] | null =
      await this.prisma.likeMagazine.findMany({
        where: {
          UserId: userId,
        },
        orderBy: {
          createdAt: 'desc', //* '좋아요' 누른 시간대의 최신순으로 정렬
        },
        select: {
          Magazine: {
            select: {
              magazineId: true,
              title: true,
              content: true,
              mainImage: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: {
                  LikeMagazine: true,
                },
              },
            },
          },
        },
      });

    const parseLikeMagazines: object[] =
      this.parseLikeMagazinesModel(LikeMagazines);

    return { data: parseLikeMagazines };
  }

  parseLikeMagazinesModel(Magazines: object[]) {
    return Magazines.map((Magazine) => {
      let obj = {};

      // 첫 번째 레벨의 키-값을 대상 객체에 복사합니다.
      Object.entries(Magazine).forEach(([key, value]) => {
        if (typeof value === 'object' && !(value instanceof Date)) {
          // 두 번째 레벨의 키-값도 대상 객체에 복사합니다.
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === 'object' && !(subValue instanceof Date)) {
              // 두 번째 레벨의 키-값도 대상 객체에 복사합니다.
              Object.entries(subValue).forEach(([subKey1, subValue1]) => {
                obj[subKey1] = subValue1;
              });
            } else {
              obj[subKey] = subValue;
            }
          });
        } else {
          obj[key] = value;
        }
      });
      return obj;
    });
  }

  parseLikeMagazineModel(Magazine: object) {
    let obj = {};

    // 첫 번째 레벨의 키-값을 대상 객체에 복사합니다.
    Object.entries(Magazine).forEach(([key, value]) => {
      if (typeof value === 'object' && !(value instanceof Date)) {
        // 두 번째 레벨의 키-값도 대상 객체에 복사합니다.
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'object' && !(subValue instanceof Date)) {
            // 두 번째 레벨의 키-값도 대상 객체에 복사합니다.
            Object.entries(subValue).forEach(([subKey1, subValue1]) => {
              obj[subKey1] = subValue1;
            });
          } else {
            obj[subKey] = subValue;
          }
        });
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }
}
