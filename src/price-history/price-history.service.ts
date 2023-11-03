import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { subMonths, format } from 'date-fns'; // format 함수를 import

@Injectable()
export class PriceHistoryService {
  constructor(private prisma: PrismaService) {}

  async findPriceHistoryByProductId(productId: number) {
    const oneMonthAgo = subMonths(new Date(), 1);

    // 지난 1주일간 동안의 가격 이력을 조회
    const priceHistories = await this.prisma.priceHistory.findMany({
      where: {
        ProductId: productId,
        createdAt: {
          gte: oneMonthAgo,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 각 날짜의 최소 가격을 찾기
    const dailyMinPrices: Record<string, number> = {};
    priceHistories.forEach((history) => {
      const dateStr = format(history.createdAt, 'yyyy-MM-dd');
      if (!dailyMinPrices[dateStr] || history.price < dailyMinPrices[dateStr]) {
        dailyMinPrices[dateStr] = history.price;
      }
    });

    // 최대값과 최소값 계산
    const minPrices = Object.values(dailyMinPrices);
    const maxPrice = Math.max(...minPrices);
    const minPrice = Math.min(...minPrices);

    return {
      maxPrice,
      minPrice,
      priceHistoryForWeek: dailyMinPrices, // 각 날짜의 최소 가격을 반환
    };
  }
}
