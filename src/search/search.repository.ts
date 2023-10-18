import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SearchRepository {
  constructor(private prisma: PrismaService) {}

  async searchProduct(search: string) {
    // 공백을 기준으로 검색어를 각각 분리
    const searchWords = search.split(' ');
    // 검색어가 포함된 상품을 찾기 위한 조건
    const searchCondition = searchWords.map((word) => ({
      productName: {
        contains: word,
      },
    }));

    // 전체 검색어도 포함
    searchCondition.push({
      productName: {
        contains: search,
      },
    });
    // 검색어가 1개인 경우
    const products = await this.prisma.product.findMany({
      where: {
        OR: searchCondition, //검색어가 포함된 상품을 찾는다.
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

  //   async searchProduct(search: string) {
  //     const products = await this.prisma.product.findMany({
  //       where: {
  //         productName: {
  //           contains: search, // 'search'가 포함된 productName을 찾는다. %search%와 같음
  //         },
  //       },
  //       select: {
  //         productId: true,
  //         coupangItemId: true,
  //         coupangVendorId: true,
  //         productName: true,
  //         productImage: true,
  //         isOutOfStock: true,
  //         originalPrice: true,
  //         currentPrice: true,
  //         discountRate: true,
  //         cardDiscount: true,
  //         createdAt: true,
  //         updatedAt: true,
  //         ProductCategory: {
  //           select: {
  //             Category: {
  //               select: {
  //                 categoryId: true,
  //                 categoryName: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });
  //     return products;
  //   }
}
