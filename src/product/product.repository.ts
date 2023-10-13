import { Injectable } from "@nestjs/common";
import { PrismaClient, Product } from "@prisma/client";


@Injectable()
export class ProductRepository {
    constructor(private readonly prisma: PrismaClient) {}

    //* 상품 전체 조회 
    async getAllProducts() {
        const products = await this.prisma.product.findMany({
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

    //* 상품 상위10개 조회
    async getTop10Products() {
        const products = await this.prisma.product.findMany({
            where: {
                discountRate: {
                    not: null,
                },
            },
            orderBy: {
                discountRate: 'desc',
            },
            take: 10,
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
    async getProductDetail(productId: number){
        const product = await this.prisma.product.findUnique({
            where: { productId }, 
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
                productUrl: true,
                productPartnersUrl: true,
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

            }
        });

        return product;
    } 
}