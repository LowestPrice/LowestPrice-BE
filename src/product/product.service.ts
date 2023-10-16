import { HttpException, Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  //* 상품 전체 조회
  async getAllProducts() {
    const products = await this.productRepository.getAllProducts();

    return products.map((product) => ({
      ...product,
      coupangItemId: product.coupangItemId.toString(), // BigInt를 문자열로 변환
      coupangVendorId: product.coupangVendorId.toString(), // BigInt를 문자열로 변환
    }));
  }

  //* 상품 상위10개 조회
  async getTop10Products() {
    const products = await this.productRepository.getTop10Products();

    return products.map((product) => ({
      ...product,
      coupangItemId: product.coupangItemId.toString(), // BigInt를 문자열로 변환
      coupangVendorId: product.coupangVendorId.toString(), // BigInt를 문자열로 변환
    }));
  }

  //* 상품 카테고리별 조회
  async getProductsByCategory(categoryName: string) {
    const products =
      await this.productRepository.getProductsByCategory(categoryName);

    return products.map((product) => ({
      ...product,
      coupangItemId: product.coupangItemId.toString(), // BigInt를 문자열로 변환
      coupangVendorId: product.coupangVendorId.toString(), // BigInt를 문자열로 변환
    }));
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
      categoryId: product.ProductCategory.map(
        (category) => category.Category.categoryId
      ),
      categoryName: product.ProductCategory.map(
        (category) => category.Category.categoryName
      ),
    };
    return productDetail;
  }
}
