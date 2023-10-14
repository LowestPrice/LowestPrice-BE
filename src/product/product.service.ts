import { HttpException, Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  //* 상품 전체 조회
  async getAllProducts() {
    const products = await this.productRepository.getAllProducts();

    const parseProducts = this.parseProductsModel(products);

    return { data: parseProducts };
  }

  //* 상품 상위10개 조회
  async getTop10Products() {
    const products = await this.productRepository.getTop10Products();

    const parseProducts = this.parseProductsModel(products);

    return { data: parseProducts };
  }

  //* 상품 카테고리별 조회
  async getProductsByCategory(categoryName: string) {
    const products =
      await this.productRepository.getProductsByCategory(categoryName);

    const parseProducts = this.parseProductsModel(products);

    return { data: parseProducts };
  }

  //* 상품 상세 조회
  async getProductDetail(productId: number) {
    const product = await this.productRepository.getProductDetail(productId);

    if (!product) {
      throw new HttpException('선택한 페이지를 찾을 수 없습니다.', 404);
    }

    const productDetail = {
      productId: product.productId,
      coupangItemId: product.coupangItemId.toString(),
      coupangVendorId: product.coupangVendorId.toString(),
      productName: product.productName,
      productImage: product.productImage,
      isOutOfStock: product.isOutOfStock,
      originalPrice: product.originalPrice,
      currentPrice: product.currentPrice,
      discountRate: product.discountRate,
      cardDiscount: product.cardDiscount,
      productUrl: product.productUrl,
      productPartnersUrl: product.productPartnersUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryId: product.ProductCategory.map(
        (category) => category.Category.categoryId
      ),
      categoryName: product.ProductCategory.map(
        (category) => category.Category.categoryName
      ),
    };
    return productDetail;
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
}
