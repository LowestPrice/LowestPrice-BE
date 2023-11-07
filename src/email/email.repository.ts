import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  KaKaoTemplate,
  ProductWithPrices,
} from './util/productWithPrices.interface';

@Injectable()
export class EmailRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 이메일용
  async getProductsWithLowerPrice(): Promise<ProductWithPrices[]> {
    return await this.prisma.$queryRaw`
    SELECT p.productName, u.email, up.atPrice, p.currentPrice, p.productPartnersUrl
    FROM User u
    INNER JOIN UserProduct up ON u.id = up.UserId
    INNER JOIN Product p ON up.ProductId = p.productId
    WHERE p.currentPrice < up.atPrice AND p.isOutOfStock = 'false';`;
  }

  // 카카오알림용
  async getProductsWithLowerPriceKaKao(): Promise<KaKaoTemplate[]> {
    return await this.prisma.$queryRaw`
    SELECT p.productId, p.productName, u.id, u.nickname, u.phone, up.atPrice AS alarmPrice, p.currentPrice, p.productPartnersUrl
    FROM User u
    INNER JOIN UserProduct up ON u.id = up.UserId
    INNER JOIN Product p ON up.ProductId = p.productId
    WHERE p.currentPrice < up.atPrice AND p.isOutOfStock = 'false';`;
  }
}
