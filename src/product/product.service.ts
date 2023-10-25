import { HttpException, Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

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
    isOutOfStock: string
  ) {
    // 쿼리스트링으로 받은 isOutOfStock의 타입을 boolean으로 변환
    // isOutOfStock의 값이 'true'이면 true, 그렇지 않으면 false
    const isOutOfStockBoolean = isOutOfStock === 'true' ? true : false;

    const products = await this.productRepository.getProductsByCategory(
      categoryName,
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

  //* 상품 카테고리별 필터기능 조회
  async getProductsByCategoryAndFilter(
    categoryName: string,
    filter: string,
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
        userId,
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
}
