import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LikeMagazine, Magazine, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as AWS from 'aws-sdk';
import { extname, resolve } from 'path';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import { Console } from 'console';
@Injectable()
export class MagazineService {
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
  // Todo: 매거진 상세조회, 수정, 삭제 시 매거진 존재하는지 확인하는 로직 추가

  async create(
    file: Express.Multer.File,
    data: Prisma.MagazineCreateInput
  ): Promise<object> {
    try {
      console.log(`진입`);
      const key = `${Date.now()}${extname(file.originalname)}`;
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        // ACL: 'public-read',
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      // s3 업로드

      //1
      // const upload = await this.s3
      //   .putObject({
      //     Key: key,
      //     Body: file.buffer,
      //     ContentType: file.mimetype,
      //     Bucket: process.env.AWS_S3_BUCKET_NAME,
      //     // ACL: 'public-read',
      //   })
      //   .promise();
      //2
      // const uploadObject = new Promise((resolve, reject) => {
      //   return this.s3.putObject(params, (err, data) => {
      //     if (err) reject(err);
      //     resolve(key);
      //   });
      // });

      //3
      const uploadObject: ManagedUpload.SendData = await this.s3
        .upload(params)
        .promise();

      const fileUrl = uploadObject.Location;

      data.mainImage = fileUrl;
      // const uploadObject = new Promise(
      //   (resolve, reject) => {
      //     this.s3.upload(params, (err, data: ManagedUpload.SendData) => {
      //       if (err) {
      //         console.error('S3 업로드 중 에러 발생:', err);
      //         reject('파일 업로드 중 에러가 발생했습니다.');
      //       }
      //       resolve(data);
      //     });
      //   }
      // );

      //const uploadResult = await this.s3.putObject(params).promise();

      //console.log(uploadObject);
      // const res = await this.s3.upload(params).promise();
      // console.log(res);
      console.log(fileUrl);

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

  //* 객체 한줄로 펴주기(배열)
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

  //* 객체 한줄로 펴주기(객체)
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
