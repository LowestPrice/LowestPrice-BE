import { HttpException, Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  //* 상품 랜덤 조회
  async getRandomProducts(userId: number, isOutOfStock: string) {
    // 쿼리스트링으로 받은 isOutOfStock의 타입을 boolean으로 변환
    // isOutOfStock의 값이 'true'이면 true, 그렇지 않으면 false
    const isOutOfStockBoolean = isOutOfStock === 'true' ? true : false;

    const products =
      await this.productRepository.getRandomProducts(isOutOfStockBoolean);

    // 상품 알림 여부 확인
    // Promise 객체의 배열을 받아서 모든 프로미스가 이행됐을때, 하나의 배열로 결과를 반환
    const addAlertProducts = await Promise.all(
      //새로운 배열 생성 -> products 배열의 모든 요소에 대해 비동기 작업 수행
      products.map(async (product) => {
        const isAlertOn = await this.checkAlertStatus(product, userId);
        return {
          ...product,
          isAlertOn,
        };
      })
    );

    // 상품 알림 여부를 추가한 배열을 객체로 변환
    const parseProducts = this.parseProductsModel(addAlertProducts);

    return { data: parseProducts };
  }

  //* 상품 전체 조회
  async getAllProducts(userId: number, isOutOfStock: string) {
    // 쿼리스트링으로 받은 isOutOfStock의 타입을 boolean으로 변환
    // isOutOfStock의 값이 'true'이면 true, 그렇지 않으면 false
    const isOutOfStockBoolean = isOutOfStock === 'true' ? true : false;

    const products = await this.productRepository.getAllProducts(
      userId,
      isOutOfStockBoolean
    );

    // 상품 알림 여부 확인
    // Promise 객체의 배열을 받아서 모든 프로미스가 이행됐을때, 하나의 배열로 결과를 반환
    const addAlertProducts = await Promise.all(
      //새로운 배열 생성 -> products 배열의 모든 요소에 대해 비동기 작업 수행
      products.map(async (product) => {
        const isAlertOn = await this.checkAlertStatus(product, userId);
        return {
          ...product,
          isAlertOn,
        };
      })
    );

    // 상품 알림 여부를 추가한 배열을 객체로 변환
    const parseProducts = this.parseProductsModel(addAlertProducts);

    return { data: parseProducts };
  }

  //* 상품 상위10개 조회
  async getTop10Products(userId: number) {
    const products = await this.productRepository.getTop10Products(userId);

    // 상품 알림 여부 확인
    // Promise 객체의 배열을 받아서 모든 프로미스가 이행됐을때, 하나의 배열로 결과를 반환
    const addAlertProducts = await Promise.all(
      //새로운 배열 생성 -> products 배열의 모든 요소에 대해 비동기 작업 수행
      products.map(async (product) => {
        const isAlertOn = await this.checkAlertStatus(product, userId);
        return {
          ...product,
          isAlertOn,
        };
      })
    );

    // 상품 알림 여부를 추가한 배열을 객체로 변환
    const parseProducts = this.parseProductsModel(addAlertProducts);

    return { data: parseProducts };
  }

  //* 상품 카테고리별 조회
  async getProductsByCategory(
    categoryName: string,
    userId: number,
    lastId: number | null,
    isOutOfStock: string
  ) {
    // 쿼리스트링으로 받은 isOutOfStock의 타입을 boolean으로 변환
    // isOutOfStock의 값이 'true'이면 true, 그렇지 않으면 false
    const isOutOfStockBoolean = isOutOfStock === 'true' ? true : false;

    const products = await this.productRepository.getProductsByCategory(
      categoryName,
      lastId,
      isOutOfStockBoolean
    );

    console.log('lastId: ', lastId, 'typeOf: ', typeof lastId);

    console.log('service products: ', products);
    // 상품 알림 여부 확인
    // Promise 객체의 배열을 받아서 모든 프로미스가 이행됐을때, 하나의 배열로 결과를 반환
    const addAlertProducts = await Promise.all(
      //새로운 배열 생성 -> products 배열의 모든 요소에 대해 비동기 작업 수행
      products.map(async (product) => {
        const isAlertOn = await this.checkAlertStatus(product, userId);
        return {
          ...product,
          isAlertOn,
        };
      })
    );

    // 상품 알림 여부를 추가한 배열을 객체로 변환
    const parseProducts = this.parseProductsModel(addAlertProducts);

    console.log('parseProducts: ', parseProducts);
    console.log('lastId: ', lastId, 'typeOf: ', typeof lastId);

    if (Object.entries(parseProducts).length === 0) {
      return { undefined };
    }

    return { data: parseProducts };
  }

  //* 상품 카테고리별 필터기능 조회
  async getProductsByCategoryAndFilter(
    categoryName: string,
    filter: string,
    lastId: number | null,
    userId: number,
    isOutOfStock: string
  ) {
    console.log(`categoryName: ${categoryName}, filter:${filter}`);

    // 쿼리스트링으로 받은 isOutOfStock의 타입을 boolean으로 변환
    // isOutOfStock의 값이 'true'이면 true, 그렇지 않으면 false
    const isOutOfStockBoolean = isOutOfStock === 'true' ? true : false;

    const products =
      await this.productRepository.getProductsByCategoryAndFilter(
        categoryName,
        filter,
        lastId,
        isOutOfStockBoolean
      );

    const addAlertProducts = await Promise.all(
      //새로운 배열 생성 -> products 배열의 모든 요소에 대해 비동기 작업 수행
      products.map(async (product) => {
        const isAlertOn = await this.checkAlertStatus(product, userId);
        return {
          ...product,
          isAlertOn,
        };
      })
    );

    // 상품 알림 여부를 추가한 배열을 객체로 변환
    const parseProducts = this.parseProductsModel(addAlertProducts);

    return { data: parseProducts };
  }

  //* 상품 상세 조회
  async getProductDetail(productId: number, userId: number) {
    const product = await this.productRepository.getProductDetail(
      productId,
      userId
    );

    let isAlertOn = await this.checkAlertStatus(product, userId);

    const parseProduct = this.parseProductModel({ ...product, isAlertOn });

    return { data: parseProduct };
  }

  //* 상품 알림 등록 함수
  private async checkAlertStatus(
    product: any,
    userId: number
  ): Promise<boolean> {
    // 사용자가 로그인하지 않은 경우
    if (!userId) return false;

    // 사용자가 로그인한 경우
    const notification = await this.productRepository.checkNotification(
      product.productId,
      userId
    );

    //checkNotification()의 결과가 있으면 true 반환, null인 경우 false 반환
    return Boolean(notification);
  }

  //* 객체 한줄로 펴주기(배열)
  parseProductsModel(products: object[]): object {
    return products.map((product) => {
      let obj = {};
      // 첫 번째 레벨의 키-값을 대상 객체에 복사합니다.
      Object.entries(product).forEach(([key, value]) => {
        if (typeof value === 'object' && !(value instanceof Date)) {
          // 두 번째 레벨의 키-값도 대상 객체에 복사합니다.
          if (Array.isArray(value)) {
            // Category 끄집어내기
            obj['Category'] = value.map((item) => item.Category);
          }
        } else {
          if (typeof value === 'bigint') {
            // type bigint -> string으로 변환
            obj[key] = value.toString();
          } else {
            obj[key] = value;
          }
        }
      });
      return obj;
    });
  }

  //* 객체 한줄로 펴주기(객체 하나)
  parseProductModel(product: object): object {
    let obj = {};
    // 첫 번째 레벨의 키-값을 대상 객체에 복사합니다.
    Object.entries(product).forEach(([key, value]) => {
      if (typeof value === 'object' && !(value instanceof Date)) {
        // 두 번째 레벨의 키-값도 대상 객체에 복사합니다.
        if (Array.isArray(value)) {
          // Category 끄집어내기
          obj['Category'] = value.map((item) => item.Category);
        }
      } else {
        if (typeof value === 'bigint') {
          // type bigint -> string으로 변환
          obj[key] = value.toString();
        } else {
          obj[key] = value;
        }
      }
    });
    return obj;
  }
  public async getSimilarProducts(
    productId: number,
    userId: number
  ): Promise<object[]> {
    // 해당 상품의 카테고리 ID와 가격 정보를 먼저 가져옵니다.
    const productDetail = await this.productRepository.getProductDetail(
      productId,
      userId
    );

    if (!productDetail || !productDetail.ProductCategory) {
      return [];
    }

    // 여기를 수정했습니다. CategoryId만 추출해서 배열로 만듭니다.
    const categoryIds = productDetail.ProductCategory.map(
      (cat) => cat.Category.categoryId
    );

    // 같은 카테고리에 속하고, 가격이 비슷한 상품을 찾습니다.
    const similarProducts = await this.productRepository.getSimilarProducts(
      categoryIds, // 수정된 부분
      productDetail.currentPrice,
      productId
    );

    // 알림 상태도 같이 체크합니다.
    const similarProductsWithAlert = await Promise.all(
      similarProducts.map(async (product) => {
        const isAlertOn = await this.checkAlertStatus(product, userId);
        return {
          ...product,
          isAlertOn,
        };
      })
    );

    // BigInt 문제를 해결하기 위해 parseProductsModel 함수를 호출합니다.
    return this.parseProductsModel(similarProductsWithAlert) as object[];
  }
}
