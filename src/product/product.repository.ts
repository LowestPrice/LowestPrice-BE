import { Injectable } from "@nestjs/common";
import { PrismaClient, Product } from "@prisma/client";


@Injectable()
export class ProductRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async getAllProducts(): Promise<Product[]> {
        return this.prisma.product.findMany();
    }

    async getProductDetail(productId: number): Promise <Product> {
        return this.prisma.product.findUnique({
            where: { productId}
        });
    } 
}