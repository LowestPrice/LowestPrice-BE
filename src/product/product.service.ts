import { Injectable } from '@nestjs/common';
import { PrismaClient, Product } from '@prisma/client';

@Injectable()
export class ProductService {
    private prisma = new PrismaClient();

    async getAllProducts() {
        const products = await this.prisma.product.findMany(); // 예를 들어 Prisma를 사용한다고 가정

        return products.map(product => ({
            ...product,
            coupangItemId: product.coupangItemId.toString(),  // BigInt를 문자열로 변환
            coupangVendorId: product.coupangVendorId.toString(), // BigInt를 문자열로 변환
        }));
    }

    async getProductDetail(id: number): Promise<Product> {
        return this.prisma.product.findUnique({
            where: {
                productId: id,
            }
        });
    }
}
