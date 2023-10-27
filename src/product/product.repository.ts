import { HttpException, Injectable } from '@nestjs/common';
import { PrismaClient, Product } from '@prisma/client';
import {
  NotFoundCategoryException,
  NotFoundCategoryFilterException,
  NotFoundProductException,
} from 'src/common/exceptions/custom-exception';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  //* 상품 전체 조회
  async getAllProducts(userId: number) {
    const products = await this.prisma.product.findMany({
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

  //* 상품 상위10개 조회
  async getTop10Products(userId: number) {
    const products = await this.prisma.product.findMany({
      where: {
        AND: [
          {
            NOT: {
              discountRate: 0, // 할인이 없는 상품은 제외
            },
          },
          {
            NOT: {
              discountRate: null, // null 값인 상품은 제외
            },
          },
          {
            isOutOfStock: false, // 품절이 아닌 상품만 조회
          },
        ],
      },
      orderBy: {
        discountRate: 'desc',
      },
      take: 10,
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

  //* 상품 카테고리별 조회
  async getProductsByCategory(categoryName: string, userId: number) {
    const categoryExists = await this.prisma.category.findUnique({
      where: { categoryName: categoryName },
    });

    if (!categoryExists) {
      throw new NotFoundCategoryException();
    }

    const products = await this.prisma.product.findMany({
      where: {
        ProductCategory: {
          some: {
            Category: {
              categoryName,
            },
          },
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

    // 해당카테고리에 제품이 없으면 Not Found 예외처리
    if (products.length === 0) {
      throw new NotFoundProductException();
    }

    // // 각 상품의 알림 상태를 확인하고 추가
    // const productsWithNotificationStatus: object[] = await Promise.all(
    //   products.map(async (product) => {
    //     let isAlertOn = false;
    //     if (userId) {
    //       const notification = await this.prisma.userProduct.findFirst({
    //         where: {
    //           UserId: userId,
    //           ProductId: product.productId,
    //         },
    //       });
    //       if (notification) isAlertOn = true;
    //     }
    //     return {
    //       ...product,
    //       isAlertOn: isAlertOn,
    //     };
    //   })
    // );

    // return productsWithNotificationStatus;
    return products;
  }

  //* 상품 카테고리별 필터기능 조회
  async getProductsByCategoryAndFilter(
    categoryName: string,
    filter: string,
    userId: number
  ) {
    const categoryExists = await this.prisma.category.findUnique({
      where: { categoryName: categoryName },
    });

    if (!categoryExists) {
      throw new NotFoundCategoryException();
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
        throw new NotFoundCategoryFilterException();
    }

    const products = await this.prisma.product.findMany({
      where: {
        AND: [
          {
            ProductCategory: {
              some: {
                Category: {
                  categoryName,
                },
              },
            },
          },
          {
            NOT: {
              discountRate: null, // null 값인 상품은 제외
            },
          },
          {
            isOutOfStock: false, // 품절이 아닌 상품만 조회
          },
        ],
      },
      orderBy: orderBy,
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

  //* 상품 상세 조회
  async getProductDetail(productId: number, userId: number) {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      select: {
        productId: true,
        realId: true,
        coupangItemId: true,
        coupangVendorId: true,
        productName: true,
        productImage: true,
        isOutOfStock: true,
        originalPrice: true,
        currentPrice: true,
        discountRate: true,
        cardDiscount: true,
        productUrl: true,
        productPartnersUrl: true,
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

    if (!product) {
      throw new NotFoundProductException();
    }

    return product;
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
  //* 유사 상품 조회
  async getSimilarProducts(
    categoryIds: number[],
    currentPrice: number,
    productId: number
  ): Promise<Product[]> {
    // 가격 범위를 설정 (예: 현재 가격의 +- 10%)
    const lowerPrice = currentPrice * 0.9;
    const upperPrice = currentPrice * 1.1;

    // 같은 카테고리에 속하고, 가격이 비슷한 상품을 찾습니다.
    // 현재 상품은 제외합니다.
    const similarProducts = await this.prisma.product.findMany({
      where: {
        AND: [
          {
            ProductCategory: {
              some: {
                CategoryId: {
                  in: categoryIds,
                },
              },
            },
          },
          {
            currentPrice: {
              gte: lowerPrice,
              lte: upperPrice,
            },
          },
          {
            NOT: {
              productId: productId,
            },
          },
        ],
      },
      include: {
        ProductCategory: true,
      },
      take: 5, // 최대 10개의 유사 상품을 가져옵니다.
    });

    return similarProducts;
  }
}
