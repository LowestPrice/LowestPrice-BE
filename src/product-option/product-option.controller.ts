// src/product-option/product-option.controller.ts

import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductOptionService } from './product-option.service';

@Controller('option')
export class ProductOptionController {
  constructor(private productOptionService: ProductOptionService) {}

  @Get(':realId')
  async findProductOptions(@Param('realId', ParseIntPipe) realId: number) {
    return await this.productOptionService.findProductOptions(realId);
  }
}
