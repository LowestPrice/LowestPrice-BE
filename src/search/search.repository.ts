import { Injectable } from '@nestjs/common';
import {
  NotFoundProductException,
  NotFoundSearchFilterException,
} from 'src/common/exceptions/custom-exception';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SearchRepository {
  constructor(private prisma: PrismaService) {}

  //* 검색어가 포함된 상품을 조회
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

    if (products.length === 0) {
      throw new NotFoundProductException();
    }

    return products;
  }

  //* 검색어가 포함된 상품을 카테고리별로 조회
  async searchProductByFilter(search: string, filter: string) {
    const searchWords = search.split(' ');

    const searchCondition = searchWords.map((word) => ({
      productName: {
        // 부분 문자열 일치를 검색하기 위해 contains를 사용
        contains: word,
      },
    }));

    let orderBy = {};

    switch (filter) {
      case 'discountRate_desc':
        orderBy = {
          discountRate: 'desc',
        };
        break;
      case 'price_asc':
        orderBy = {
          currentPrice: 'asc',
        };
        break;
      case 'price_desc':
        orderBy = {
          currentPrice: 'desc',
        };
        break;
      default:
        throw new NotFoundSearchFilterException();
    }

    const products = await this.prisma.product.findMany({
      where: {
        AND: searchCondition, //검색어가 포함된 상품을 찾는다.
      },
      orderBy: orderBy, // 정렬 조건
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

    if (products.length === 0) {
      throw new NotFoundProductException();
    }

    return products;
  }

  //* 상품 알림 존재 여부 확인 함수
  async checkNotification(productId: number, userId: number) {
    return await this.prisma.userProduct.findFirst({
      where: {
        UserId: userId,
        ProductId: productId,
      },
    });
  }
}
