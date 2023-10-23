import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LikeMagazine, Magazine, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as AWS from 'aws-sdk';
import { extname } from 'path';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';

import {
  AdminAccessDeniedException,
  NotFoundMagzineException,
} from 'src/common/exceptions/custom-exception';
@Injectable()
export class MagazineService {
  // s3 설정
  private readonly s3: AWS.S3;
  constructor(private readonly prisma: PrismaService) {
    AWS.config.update({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      },
    });
    this.s3 = new AWS.S3();
  }

  async create(
    userId: number,
    file: Express.Multer.File,
    data: Prisma.MagazineCreateInput
  ): Promise<object> {
    this.checkAdmin(userId);

    if (file) {
      const uploadObject = this.uploadFile(file);
      data.mainImage = (await uploadObject).Location;
    }

    const magazine: Magazine | null = await this.prisma.magazine.create({
      data,
    });

    return { message: '매거진 등록에 성공했습니다.' };
  }

  async findAll(userId: number | null): Promise<object> {
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

    // 객체 펴주고 좋아요 설정 여부 추가
    const parseLikeMagazines: object[] = await this.parseLikeMagazinesModel(
      magazines,
      userId
    );

    return { data: parseLikeMagazines };
  }

  async findOne(magazineId: number, userId: number): Promise<object> {
    const magazine: Object | null = await this.prisma.magazine.findUnique({
      where: {
        magazineId: magazineId,
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

    if (!magazine) {
      throw new NotFoundMagzineException();
    }

    const parseLikeMagazine: object = await this.parseLikeMagazineModel(
      magazine,
      userId
    );

    return { data: parseLikeMagazine };
  }

  async update(
    userId: number,
    magazineId: number,
    file: Express.Multer.File,
    data: Prisma.MagazineUpdateInput
  ): Promise<object> {
    this.checkAdmin(userId);

    const isExist: Object = await this.findOne(magazineId, userId);
    if (!isExist['data']) {
      throw new NotFoundMagzineException();
    }

    if (file) {
      const uploadObject = this.uploadFile(file);
      data.mainImage = (await uploadObject).Location;
    }

    const magazine: Magazine | null = await this.prisma.magazine.update({
      where: {
        magazineId: magazineId,
      },
      data: data,
    });
    return { message: '매거진 수정에 성공했습니다.' };
  }

  async remove(userId: number, magazineId: number): Promise<object> {
    this.checkAdmin(userId);

    const isExist: Object = await this.findOne(magazineId, userId);
    if (!isExist['data']) {
      throw new NotFoundMagzineException();
    }

    const magazine: Magazine | null = await this.prisma.magazine.delete({
      where: {
        magazineId: magazineId,
      },
    });
    return { message: '매거진 삭제에 성공했습니다.' };
  }

  //* 해당 매거진 제외한 나머지 매거진 리스트 조회
  //! 해당 매거진 존재 여부 예외 처리 안함
  async exceptOne(magazineId: number, userId: number): Promise<object> {
    const isExist: Object = await this.findOne(magazineId, userId);
    if (!isExist['data']) {
      throw new NotFoundMagzineException();
    }

    const magazines: Object[] | null = await this.prisma.magazine.findMany({
      where: {
        NOT: {
          magazineId: magazineId,
        },
      },
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

    const parseLikeMagazines: object[] = await this.parseLikeMagazinesModel(
      magazines,
      userId
    );

    return { data: parseLikeMagazines };
  }

  async setLike(userId: number, magazineId: number): Promise<object> {
    //* 0. 매거진 존재 여부 확인
    const isExist: Object = await this.findOne(magazineId, userId);
    if (!isExist['data']) {
      throw new NotFoundMagzineException();
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

    const parseLikeMagazines: object[] = await this.parseLikeMagazinesModel(
      LikeMagazines,
      userId
    );

    return { data: parseLikeMagazines };
  }

  //* 관리자 권한 확인
  checkAdmin(userId: number): void {
    if (userId !== Number(process.env.ADMIN)) {
      throw new AdminAccessDeniedException();
    }
  }

  //* 객체 한줄로 펴주기(배열)
  async parseLikeMagazinesModel(Magazines: object[], userId: number) {
    const parseLikeMagazines: object[] = Magazines.map((Magazine) => {
      let obj = {};

      // 첫 번째 레벨의 키-값을 대상 객체에 복사합니다.
      Object.entries(Magazine).forEach(([key, value]) => {
        if (
          typeof value === 'object' &&
          !(value instanceof Date) &&
          value !== null
        ) {
          // 두 번째 레벨의 키-값도 대상 객체에 복사합니다.
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (
              typeof subValue === 'object' &&
              !(subValue instanceof Date) &&
              subValue !== null //? null 값일 때 처리 부분
            ) {
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

    // 사용자별 조회시 좋아요 설정 표시
    const magazinesWithUserLikeStatus: object[] = await Promise.all(
      parseLikeMagazines.map(async (magazine: Magazine) => {
        let isLiked: object;
        if (userId) {
          // null이 아니고 사용자인 경우 진행
          isLiked = await this.prisma.likeMagazine.findFirst({
            where: {
              UserId: userId,
              MagazineId: magazine.magazineId,
            },
          });
        }
        return {
          ...magazine,
          isLiked: isLiked ? true : false,
        };
      })
    );

    return magazinesWithUserLikeStatus;
  }

  //* 객체 한줄로 펴주기(객체)
  async parseLikeMagazineModel(Magazine: object, userId: number) {
    let parseLikeMagazine = {};

    // 첫 번째 레벨의 키-값을 대상 객체에 복사합니다.
    Object.entries(Magazine).forEach(([key, value]) => {
      if (
        typeof value === 'object' &&
        !(value instanceof Date) &&
        value !== null
      ) {
        // 두 번째 레벨의 키-값도 대상 객체에 복사합니다.
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (
            typeof subValue === 'object' &&
            !(subValue instanceof Date) &&
            subValue !== null
          ) {
            // 두 번째 레벨의 키-값도 대상 객체에 복사합니다.
            Object.entries(subValue).forEach(([subKey1, subValue1]) => {
              parseLikeMagazine[subKey1] = subValue1;
            });
          } else {
            parseLikeMagazine[subKey] = subValue;
          }
        });
      } else {
        parseLikeMagazine[key] = value;
      }
    });

    // 사용자별 조회시 좋아요 설정 표시
    let isLiked: object = null;
    if (userId) {
      // null이 아니고 사용자인 경우 진행
      isLiked = await this.prisma.likeMagazine.findFirst({
        where: {
          UserId: userId,
          MagazineId: parseLikeMagazine['magazineId'],
        },
      });
    }

    const magazineWithUserLikeStatus: object = {
      ...parseLikeMagazine,
      isLiked: isLiked ? true : false,
    };

    return magazineWithUserLikeStatus;
  }

  //! 파일 업로드 부분
  async uploadFile(file: Express.Multer.File): Promise<ManagedUpload.SendData> {
    const key = `magazine-images/${Date.now()}${extname(file.originalname)}`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      // ACL: 'public-read',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadObject: ManagedUpload.SendData = await this.s3
      .upload(params)
      .promise();

    //const fileUrl = uploadObject.Location;

    return uploadObject;
  }
}
