import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SearchRepository {
  constructor(private prisma: PrismaService) {}

  async searchProduct(search: string) {
    const products = await this.prisma.product.findMany({
      where: {
        productName: {
          contains: search, // search가 포함된 productName을 찾는다. %search%와 같음
        },
      },
      select: {
        productId: true,
        coupangItemId: true,
        coupangVendorId: true,
        productName: true,
        productImage: true,
        isOutOfStock: true,
        originalPrice: true,
        currentPrice: true,
        discountRate: true,
        cardDiscount: true,
        createdAt: true,
        updatedAt: true,
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
    });
    return products;
  }
}
