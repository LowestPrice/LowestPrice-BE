import { HttpException, NotFoundException, Injectable } from '@nestjs/common';
import { PrismaClient, Product } from '@prisma/client';
import { add } from 'date-fns';
import {
  NotFoundCategoryException,
  NotFoundCategoryFilterException,
  NotFoundProductException,
} from 'src/common/exceptions/custom-exception';
import { shuffle } from 'lodash';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  //! 상품 랜덤 조회
  // 사용하지 않는 함수
  async getRandomProducts(isOutOfStock: boolean) {
    // 조건에 따라 whereCondition 객체에 추가
    // 타입스크립트에서 객체의 타입을 정의할 때, isOutOfStock?: boolean; 처럼 ?를 붙이면 해당 프로퍼티가 있어도 되고 없어도 되는 선택적 프로퍼티가 됨
    type WhereConditionType = {
      isOutOfStock?: boolean;
    };
    let whereCondition: WhereConditionType = {};

    // 만약 isOutOfStock 값이 false인 경우 (즉, 품절되지 않은 상품만 조회하고 싶은 경우)에만 whereCondition 객체에 추가
    if (isOutOfStock === false) {
      whereCondition.isOutOfStock = false;
    }

    // 랜덤으로 상품 8개 조회
    const pageSize = 8;
    let ids: number[] = [];

    // raw query를 사용하여 랜덤으로 상품 8개의 id를 조회
    const results = await this.prisma.$queryRawUnsafe<{ productId: number }[]>(
      `SELECT productId FROM Product WHERE isOutOfStock = ${isOutOfStock} ORDER BY RAND() LIMIT ${pageSize};`
    );

    console.log('results1: ', results);

    // results 배열에서 productId만 추출하여 ids 배열에 저장
    ids = results.map((item) => item.productId);

    // ids 배열과 isOutOfStock 값을 이용하여 상품 8개를 조회
    const products = await this.prisma.product.findMany({
      where: { AND: [{ productId: { in: ids } }, whereCondition] },
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
      take: pageSize,
    });

    return products;
  }

  //! 상품 전체 조회
  // 사용하지 않는 함수
  async getAllProducts(userId: number, isOutOfStock: boolean) {
    // 조건에 따라 whereCondition 객체에 추가
    // 타입스크립트에서 객체의 타입을 정의할 때, isOutOfStock?: boolean; 처럼 ?를 붙이면 해당 프로퍼티가 있어도 되고 없어도 되는 선택적 프로퍼티가 됨
    type WhereConditionType = {
      isOutOfStock?: boolean;
    };
    let whereCondition: WhereConditionType = {};

    // 만약 isOutOfStock 값이 false인 경우 (즉, 품절되지 않은 상품만 조회하고 싶은 경우)
    if (isOutOfStock === false) {
      whereCondition.isOutOfStock = false;
    }

    const products = await this.prisma.product.findMany({
      where: whereCondition,
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

  //* 캐러셀 - 상품 10개 랜덤 조회
  async getTop10Products(userId: number) {
    // 할인율이 높은 상품 50개 조회, 250,000원 이상의 상품만 조회
    const topProducts = await this.prisma.product.findMany({
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
          {
            currentPrice: {
              gte: 250000, // currentPrice가 250,000 이상인 상품만 조회
            },
          },
        ],
      },
      orderBy: {
        discountRate: 'desc', // 할인율이 높은 순으로 정렬
      },
      take: 50, // 상위 50개만 가져오기
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

    // 반환되는 상품이 없으면 예외처리
    if (topProducts.length === 0) {
      throw new NotFoundException('No products found.');
    }

    // lodash의 shuffle 함수를 사용하여 배열을 랜덤하게 섞은 후, 앞에서부터 10개를 선택
    const randomProducts = shuffle(topProducts).slice(0, 10);

    return randomProducts;
  }

  //* 상품 카테고리별 조회
  async getProductsByCategory(
    categoryName: string,
    lastId: number | null, // 마지막으로 조회한 상품의 id 또는 null(첫페이지의 경우)
    isOutOfStock: boolean
  ) {
    // 카테고리가 존재하는지 확인하는 함수
    const categoryExists = await this.prisma.category.findUnique({
      where: { categoryName: categoryName },
    });

    if (!categoryExists) {
      throw new NotFoundCategoryException();
    }

    // whereCondition 객체에 추가하는 기본 조건
    // 카테고리가 categoryName인 상품만 조회, 할인율이 null인 상품은 제외, currentPrice가 90,000원 초과인 상품만 조회
    const baseCondition = {
      ProductCategory: {
        some: {
          Category: {
            categoryName,
          },
        },
      },
      NOT: {
        discountRate: null, // null 값인 상품은 제외
      },
      AND: {
        currentPrice: {
          gt: 90000, // currentPrice가 90,000원 초과인 상품만 포함
        },
      },
    };

    // 추가적인 조건을 담을 배열
    const additionalCondition = [];

    // isOutOfStock 값이 false인 경우 (즉, 품절되지 않은 상품만 조회하고 싶은 경우)에만 whereCondition 객체에 추가
    if (isOutOfStock === false) {
      additionalCondition.push({ isOutOfStock: false });
    }

    // whereCondition 객체에 기본 조건과 추가 조건을 AND 연산하여 담습니다.
    const whereCondition = {
      AND: [baseCondition, ...additionalCondition],
    };

    // 커서 페이지네이션을 위한 cursorCondition 객체
    let cursorCondition = {};

    // lastId가 null이면 첫 페이지이므로 cursorCondition 객체를 추가하지 않습니다.
    const isFirstPage = !lastId;

    // lastId가 존재하면 cursorCondition 객체에 추가합니다.
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

    // 상품 조회
    const products = await this.prisma.product.findMany({
      where: whereCondition,
      take: 8,
      // 첫 페이지가 아니고, lastId가 존재하면 cursorCondition 객체를 추가합니다.
      ...(!isFirstPage && cursorCondition),
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

    // ! 추후에 액세서리 카테고리가 추가될 경우 수정할 부분
    // ProductCategory가 여러개인 상품만 필터링
    // const severalCategoryProducts = products.filter(
    //   (product) => product.ProductCategory.length > 1
    // );

    // console.log('severalCategoryProducts: ', severalCategoryProducts);
    // return severalCategoryProducts;

    // 해당 카테고리에 제품이 없으면 빈 배열을 반환합니다.
    console.log('products: ', products);
    return products;
  }

  //* 상품 카테고리별 필터기능 조회
  async getProductsByCategoryAndFilter(
    categoryName: string,
    filter: string,
    lastId: number | null,
    isOutOfStock: boolean
  ) {
    const categoryExists = await this.prisma.category.findUnique({
      where: { categoryName: categoryName },
    });

    if (!categoryExists) {
      throw new NotFoundCategoryException();
    }

    // 정렬 기준을 담을 객체를 선언합니다.
    let orderBy = {};

    // switch 문을 사용하여 정렬 기준을 설정합니다.
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

    const baseCondition = {
      ProductCategory: {
        some: {
          Category: {
            categoryName,
          },
        },
      },
      NOT: {
        discountRate: null, // null 값인 상품은 제외
      },
    };

    const additionalCondition = [];

    if (isOutOfStock === false) {
      additionalCondition.push({ isOutOfStock: false });
    }

    const whereCondition = {
      AND: [baseCondition, ...additionalCondition],
    };

    // 커서 페이지네이션을 위한 cursorCondition 객체를 선언합니다.
    let cursorCondition = {};

    // lastId가 있으면 cursorCondition 객체에 추가합니다.
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

    // 상품 조회
    const products = await this.prisma.product.findMany({
      where: whereCondition,
      ...cursorCondition,
      take: 8,
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
      // ProductCategory 모델의 데이터를 포함하여 조회합니다.
      include: {
        ProductCategory: true,
      },
      take: 5, // 5개만 가져오기
    });

    return similarProducts;
  }
}
