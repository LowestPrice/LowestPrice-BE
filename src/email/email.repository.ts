import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductWithPrices } from './util/productWithPrices.interface';

@Injectable()
export class EmailRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProductsWithLowerPrice(): Promise<ProductWithPrices[]> {
    return await this.prisma.$queryRaw`
    SELECT p.productName, u.email, up.atPrice, p.currentPrice, p.productPartnersUrl
    FROM User u
    INNER JOIN UserProduct up ON u.id = up.UserId
    INNER JOIN Product p ON up.ProductId = p.productId
    WHERE p.currentPrice < up.atPrice AND p.isOutOfStock = 'false';`;
  }
}
