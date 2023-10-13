import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from 'src/partners/partners.service';

import { sleep } from './utils/timeSleep';

@Injectable()
export class ShortenUrlService {
  private readonly logger = new Logger(ShortenUrlService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly partnersService: PartnersService
  ) {}

  async updateShortenUrls() {
    try {
      this.logger.log('CproductPartnersUrl 업데이트 시작');

      const products = await this.prisma.product.findMany({
        where: {
          productPartnersUrl: {
            equals: null,
          },
        },
        orderBy: {
          updatedAt: 'asc', // 최근에 업데이트되지 않은 상품을 먼저 처리
        },
      });

      this.logger.log(`Total products to update: ${products.length}`);

      let failedCount = 0; // 실패한 상품 개수를 추적

      for (const [index, product] of products.entries()) {
        try {
          if (index % 49 === 0 && index !== 0) {
            this.logger.log('Waiting for 70 seconds...');
            await sleep(70000);
          }

          this.logger.log(
            `Updating product ${index + 1}: ${product.coupangVendorId}`
          );

          const shortenUrl = await this.partnersService.getShortenUrl(
            product.productUrl
          );

          if (!shortenUrl) {
            this.logger.warn(
              `Skipping product ${index + 1}: ${product.coupangVendorId}`
            );
            failedCount++;
            continue;
          }

          await this.prisma.product.update({
            where: { coupangVendorId: product.coupangVendorId },
            data: { productPartnersUrl: shortenUrl },
          });

          this.logger.log(
            `Successfully updated product ${index + 1}: ${
              product.coupangVendorId
            }`
          );
        } catch (error) {
          this.logger.error(
            `PartnersService Error for product ${index + 1}: ${
              product.coupangVendorId
            }`,
            error
          );
          failedCount++;
        }

        // 전체 에러 체크
        if (failedCount === products.length) {
          this.logger.error('All products failed to update. Exiting...');
          break;
        }
      }
    } catch (error) {
      this.logger.error(
        `Update Shorten URLs failed: ${error.message}`,
        error.stack
      );
    }
  }
}
