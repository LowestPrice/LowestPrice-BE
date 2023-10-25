import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductWithPrices } from './util/productWithPrices.interface';

@Injectable()
export class EmailRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService
  ) {}

  async sendMail(list: ProductWithPrices) {
    await this.mailerService
      .sendMail({
        to: list.email, // 누구에게
        subject: '내일은 최저가 알림', // 제목
        text: `[${list.productName}] 상품의 가격이 ${list.atPrice}(원) 에서 ${list.currentPrice}(원) 으로 현재 최저가 입니다.`, // 내용
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        new ConflictException(err);
      });
    return true;
  }

  async getProductsWithLowerPrice(): Promise<ProductWithPrices[]> {
    return await this.prisma.$queryRaw`
    SELECT p.productName, u.email, up.atPrice, p.currentPrice
    FROM User u
    INNER JOIN UserProduct up ON u.id = up.UserId
    INNER JOIN Product p ON up.ProductId = p.productId
    WHERE p.currentPrice < up.atPrice;`;
  }
}
