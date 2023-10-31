import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';

@Injectable()
export class SearchService {
  constructor(private searchRepository: SearchRepository) {}

  //* 검색어 변환
  // 사람들이 자주 사용할 것 같은 단어를 productName에 포함된 단어로 변환
  transformSearch(search: string): string {
    console.log(`original search: ${search}`);
    // 붙여쓰기를 띄어쓰기로 변환
    // '아이패드프로실버'와 같은 문자열을 '아이패드 프로 실버'로 변환
    // 너무 많은 조건이 붙으면 성능이 떨어질 수 있으므로 최대한 간단하게 처리 (검색어 작성법 안내 필요 : 아이폰 버전 색상 순서로 작성해주세요)
    const pattern =
      /(.+?)?(아이폰|아이패드|에어팟|맥북|애플워치)(프로|에어|미니)?(.*)?/;
    search = search.replace(pattern, (match, p0, p1, p2, p3) => {
      let result = '';

      // 제품명 앞에 오는 문자열 처리
      if (p0) {
        // p0 변수의 값을 앞뒤 공백을 제거한 후 추가한 다음에 띄어쓰기를 추가
        result += `${p0.trim()} `;
      }

      // 제품카테고리 처리
      result += p1;

      // 제품별 옵션(프로, 에어, 미니 등) 처리
      if (p2) {
        result += ` ${p2}`;
      }

      // 제품명 뒤에 오는 문자열 처리
      if (p3) {
        result += ` ${p3.trim()}`;
      }

      return result;
    });

    // 애플 -> Apple, 인데 '애플워치'는 그대로 두기
    if (search.includes('애플') && !search.includes('애플워치')) {
      search = search.replace('애플', 'Apple');
    }

    // 아이폰 프로-> 아이폰 Pro
    if (search.includes('아이폰 프로')) {
      search = search.replace('아이폰 프로', '아이폰 Pro');
    }

    // 아이폰 미니-> 아이폰 Mini
    if (search.includes('아이폰 미니')) {
      search = search.replace('아이폰 미니', '아이폰 Mini');
    }

    // 아이패드 미니-> 아이패드 mini
    if (search.includes('아이패드 미니')) {
      search = search.replace('아이패드 미니', '아이패드 mini');
    }

    console.log(`transformed search: ${search}`);
    return search;
  }

  //* 상품 검색
  async searchProduct(
    search: string,
    userId: number,
    lastId: number | null,
    isOutOfStock: string
  ) {
    // 쿼리스트링으로 받은 isOutOfStock의 타입을 boolean으로 변환
    // isOutOfStock의 값이 'true'이면 true, 그렇지 않으면 false
    const isOutOfStockBoolean = isOutOfStock === 'true' ? true : false;

    // 변환된 검색어
    const transformedSearch = this.transformSearch(search);

    const products = await this.searchRepository.searchProduct(
      transformedSearch,
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

  //* 상품 검색 필터기능
  async searchProductByFilter(
    search: string,
    filter: string,
    userId: number,
    lastId: number | null,
    isOutOfStock: string
  ) {
    // 쿼리스트링으로 받은 isOutOfStock의 타입을 boolean으로 변환
    // isOutOfStock의 값이 'true'이면 true, 그렇지 않으면 false
    const isOutOfStockBoolean = isOutOfStock === 'true' ? true : false;

    // 변환된 검색어
    const transformedSearch = this.transformSearch(search);

    const products = await this.searchRepository.searchProductByFilter(
      transformedSearch,
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

  //* 상품 알림 등록 함수
  private async checkAlertStatus(
    product: any,
    userId: number
  ): Promise<boolean> {
    // 사용자가 로그인하지 않은 경우
    if (!userId) return false;

    // 사용자가 로그인한 경우
    const notification = await this.searchRepository.checkNotification(
      product.productId,
      userId
    );

    //checkNotification()의 결과가 있으면 true 반환, null인 경우 false 반환
    return Boolean(notification);
  }

  //* 객체 한줄로 펴주기(배열)
  private parseProductsModel(products: object[]): object {
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
}
