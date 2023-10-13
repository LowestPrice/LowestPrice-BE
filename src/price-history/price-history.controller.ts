// src/price-history/price-history.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { PriceHistoryService } from './price-history.service';
import { ParseIntPipe } from '../pipes/parse-int.pipe'; // ParseIntPipe를 import합니다.

@Controller('price-history')
export class PriceHistoryController {
  constructor(private priceHistoryService: PriceHistoryService) {}

  @Get(':productId')
  async getPriceHistory(@Param('productId', ParseIntPipe) productId: number) {
    // ParseIntPipe를 사용합니다.
    return await this.priceHistoryService.findPriceHistoryByProductId(
      productId
    );
  }
}
