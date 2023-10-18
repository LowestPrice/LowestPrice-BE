import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';

@Injectable()
export class SearchService {
  constructor(private searchRepository: SearchRepository) {}

  //* 검색어 변환
  // 사람들이 자주 사용할 것 같은 단어를 productName에 포함된 단어로 변환
  transformSearch(search: string): string {
    // 붙여쓰기를 띄어쓰기로 변환
    // '아이패드프로실버'와 같은 문자열을 '아이패드 프로 실버'로 변환
    const pattern = /(아이폰|아이패드|에어팟|맥북)(프로|에어|미니)?(.*)?/;
    search = search.replace(pattern, (match, p1, p2, p3) => {
      let result = p1;
      if (p2) {
        result += ` ${p2}`;
      }
      if (p3) {
        result += ` ${p3}`;
      }
      return result;
    });

    // 애플 -> Apple
    if (search.includes('애플')) {
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

    return search;
  }

  //* 상품 검색
  async searchProduct(search: string) {
    // 변환된 검색어
    const transformedSearch = this.transformSearch(search);

    const products =
      await this.searchRepository.searchProduct(transformedSearch);

    const parseProducts = this.parseProductsModel(products);

    return { data: parseProducts };
  }

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
