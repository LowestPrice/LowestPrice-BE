import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService {
    constructor(private readonly productRepository: ProductRepository) {}

    async getAllProducts() {
        const products = await this.productRepository.getAllProducts(); 

        return products.map(product => ({
            ...product,
            coupangItemId: product.coupangItemId.toString(),  // BigInt를 문자열로 변환
            coupangVendorId: product.coupangVendorId.toString(), // BigInt를 문자열로 변환
        }));
    }

    async getProductDetail(productId: number): Promise<Product> {
        return this.productRepository.getProductDetail(productId);
    }
}
