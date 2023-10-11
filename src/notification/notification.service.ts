import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Product, UserProduct } from '@prisma/client';
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
      throw new HttpException(
        '해당 제품이 존재하지 않습니다.',
        HttpStatus.NOT_FOUND
      );
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
}
