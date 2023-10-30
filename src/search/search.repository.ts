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
  async searchProduct(
    search: string,
    lastId: number | null, // 마지막으로 조회한 상품의 id 또는 null(첫페이지의 경우)
    isOutOfStock: boolean
  ) {
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

    // 타입스크립트에서 객체의 타입을 정의할 때, isOutOfStock?: boolean; 처럼 ?를 붙이면 해당 프로퍼티가 있어도 되고 없어도 되는 선택적 프로퍼티가 됨
    type WhereCondition = {
      AND?: typeof searchCondition;
      isOutOfStock?: boolean;
    };

    let whereCondition: WhereCondition = { AND: searchCondition }; //검색어가 포함된 상품을 찾는다.

    // 조건에 따라 whereCondition 객체에 추가
    // 만약 isOutOfStock 값이 false인 경우 (즉, 품절되지 않은 상품만 조회하고 싶은 경우)
    if (isOutOfStock === false) {
      whereCondition.isOutOfStock = false;
    }

    let cursorCondition = {};

    console.log('lastId: ', lastId, 'typeOf: ', typeof lastId);
    if (lastId) {
      cursorCondition = {
        cursor: {
          // 마지막으로 조회한 상품의 ID
          productId: lastId,
        },
        // 커서의 상품을 건너뜁니다.
        skip: 1,
      };
    }

    console.log('lastId: ', lastId, 'typeOf: ', typeof lastId);

    //* 검색결과 조회시 AND 조건으로 조회
    const products = await this.prisma.product.findMany({
      where: whereCondition,
      ...cursorCondition,
      take: 8,
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
  async searchProductByFilter(
    search: string,
    filter: string,
    isOutOfStock: boolean
  ) {
    const searchWords = search.split(' ');

    const searchCondition = searchWords.map((word) => ({
      productName: {
        // 부분 문자열 일치를 검색하기 위해 contains를 사용
        contains: word,
      },
    }));

    // 타입스크립트에서 객체의 타입을 정의할 때, isOutOfStock?: boolean; 처럼 ?를 붙이면 해당 프로퍼티가 있어도 되고 없어도 되는 선택적 프로퍼티가 됨
    type WhereCondition = {
      AND?: typeof searchCondition;
      isOutOfStock?: boolean;
    };

    let whereCondition: WhereCondition = { AND: searchCondition }; // 기본 검색 조건

    // 조건에 따라 whereCondition 객체에 추가
    // 만약 isOutOfStock 값이 false인 경우 (즉, 품절되지 않은 상품만 조회하고 싶은 경우)
    if (isOutOfStock === false) {
      whereCondition.isOutOfStock = false;
    }

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
      where: whereCondition,
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
