import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductOptionService {
  constructor(private prisma: PrismaService) {}

  async findProductOptions(realId: number) {
    const products = await this.prisma.product.findMany({
      where: { realId },
      select: {
        productId: true,
        currentPrice: true,
        productName: true,
        discountRate: true,
      },
    });

    // 상품명에서 첫 번째 쉼표 이후의 문자열을 추출
    const modifiedProducts = products.map((product) => ({
      ...product,
      productName: product.productName.split(',').slice(1).join(',').trim(),
    }));

    return modifiedProducts;
  }
}
