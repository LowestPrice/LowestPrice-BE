import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Product, UserProduct } from '@prisma/client';
import { NotFoundProductException } from 'src/common/exceptions/custom-exception';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  //! 코드 분리해서 재활용 해야 할 것 같음
  async findProduct(productId: number): Promise<Product> | null {
    return this.prisma.product.findUnique({
      where: {
        productId: productId,
      },
    });
  }

  //* 상품 알림 설정
  async setNotification(userId: number, productId: number): Promise<object> {
    // 0. 상품 존재 여부 확인

    const isExist: Promise<Product> | null = this.findProduct(productId);

    if (!isExist) {
      throw new NotFoundProductException();
    }

    // 1. '알림' 여부 확인
    const isNotification: UserProduct | null =
      await this.prisma.userProduct.findFirst({
        where: {
          ProductId: productId,
          UserId: userId,
        },
      });

    // 1-1. '알림' 안 했으면 알림 등록
    if (!isNotification) {
      await this.prisma.userProduct.create({
        data: {
          ProductId: productId,
          UserId: userId,
        },
      });

      return { message: '알림 등록에 성공했습니다.' };
    }

    // 1-2. 알림' 했으면 알림 취소
    await this.prisma.userProduct.delete({
      where: {
        userProductId: isNotification.userProductId,
      },
    });

    return { message: '알림 취소에 성공했습니다.' };
  }

  //* 알림 설정한 상품 조회
  async findAll(userId: number): Promise<object> {
    const products: Object[] | null = await this.prisma.userProduct.findMany({
      where: {
        UserId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        Product: {
          include: {
            ProductCategory: {
              select: {
                Category: {
                  select: {
                    categoryId: true,
                    categoryName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const parseProducts = this.parseProductsModel(products);

    return { data: parseProducts };
  }

  //* 객체 한줄로 펴주기(배열)
  parseProductsModel(products: object[]): object {
    return products.map((product) => {
      let obj = {};

      // 첫 번째 레벨의 키-값을 대상 객체에 복사합니다.
      Object.entries(product).forEach(([key, value]) => {
        if (typeof value === 'object' && !(value instanceof Date)) {
          // 두 번째 레벨의 키-값도 대상 객체에 복사합니다.
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === 'bigint') {
              // type bigint -> string으로 변환
              obj[subKey] = subValue.toString();
            } else if (Array.isArray(subValue)) {
              // Category 끄집어내기
              obj['Category'] = subValue.map((item) => item.Category);
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
}
