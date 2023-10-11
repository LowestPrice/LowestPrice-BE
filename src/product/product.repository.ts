import { Injectable } from "@nestjs/common";
import { PrismaClient, Product } from "@prisma/client";


@Injectable()
export class ProductRepository {
    constructor(private readonly prisma: PrismaClient) {}

    // 상품 전체 조회 
    async getAllProducts() {
        const product = await this.prisma.product.findMany({
            select: {
                productId: true,
                coupangItemId: true,
                coupangVendorId: true,
                productName: true,
                productImage: true,
                isOutOfStock: true,
                originalPrice: true,
                currentPrice: true,
            
                ProductCategory: {
                    select: {
                        Category: {
                            select: {
                                categoryId: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        return product;
    }

    async getProductDetail(productId: number): Promise <Product> {
        return this.prisma.product.findUnique({
            where: { productId}
        });
    } 
}