import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AlarmHistory, Product, UserProduct } from '@prisma/client';
import {
  NotFoundNotificationException,
  NotFoundProductException,
} from 'src/common/exceptions/custom-exception';
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

    const isExist: Product | null = await this.findProduct(productId);

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
          atPrice: isExist.currentPrice, //! 알림 설정할 당시 가격 설정
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

    const parseProducts: object[] = await this.parseProductsModel(
      products,
      userId
    );

    return { data: parseProducts };
  }

  //* 알림 내역 조회
  async getNotification(userId: number): Promise<object> {
    const history: AlarmHistory[] | null =
      await this.prisma.alarmHistory.findMany({
        where: {
          UserId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    history.map((data: AlarmHistory) => {
      return {
        ...data,
        productName: data.productName.split(',')[0],
        productOption: data.productName.split(',')[1],
      };
    });

    return { data: history };
  }

  //* 알림 내역 삭제
  async removeNotification(userId: number, alarmHistoryId: number) {
    // const isExist: AlarmHistory = await this.prisma.alarmHistory.findFirst({
    //   where: {
    //     alarmHistoryId: alarmHistoryId,
    //     UserId: userId,
    //   },
    // });

    // if (!isExist) {
    //   throw new NotFoundNotificationException();
    // }

    try {
      const alarm: AlarmHistory | null = await this.prisma.alarmHistory.delete({
        where: {
          alarmHistoryId: alarmHistoryId,
          UserId: userId,
        },
      });
    } catch (err) {
      throw new NotFoundNotificationException();
    }

    return { message: '알림 내역 삭제에 성공했습니다.' };
  }

  //* 객체 한줄로 펴주기(배열)
  async parseProductsModel(
    products: object[],
    userId: number
  ): Promise<object[]> {
    const parseProducts = products.map((product) => {
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

    const userNotificationStatus: object[] = await Promise.all(
      parseProducts.map(async (product: Product) => {
        let isAlertOn: object;
        if (userId) {
          // null이 아니고 사용자인 경우 진행
          isAlertOn = await this.prisma.userProduct.findFirst({
            where: {
              UserId: userId,
              ProductId: product.productId,
            },
          });
        }
        return {
          ...product,
          isAlertOn: isAlertOn ? true : false,
        };
      })
    );
    return userNotificationStatus;
  }
}
