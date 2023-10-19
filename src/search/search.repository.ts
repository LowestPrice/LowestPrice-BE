import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SearchRepository {
  constructor(private prisma: PrismaService) {}

  async searchProduct(search: string) {
    // 공백을 기준으로 검색어를 각각 분리해서 배열로 만듬
    const searchWords = search.split(' ');
    // 검색어가 포함된 상품을 찾기 위한 조건
    // 배열의 각 요소에 대해 productName에 검색어가 포함되었는지 검사하는 조건이 담긴 객체가 포함된 배열을 만듬
    const searchCondition = searchWords.map((word) => ({
      productName: {
        // 부분 문자열 일치를 검색하기 위해 contains를 사용
        contains: word,
      },
    }));

    // // 전체 검색어도 포함 // 이거를 추가하게 되면 AND 로 했을때 이 조건도 충족해야해서 제외
    // searchCondition.push({
    //   productName: {
    //     contains: search,
    //   },
    // });

    //* 검색결과 조회시 AND 조건으로 조회
    const products = await this.prisma.product.findMany({
      where: {
        AND: searchCondition, //검색어가 포함된 상품을 찾는다.
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
