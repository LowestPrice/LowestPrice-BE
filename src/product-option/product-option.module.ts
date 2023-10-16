// src/product-option/product-option.module.ts

import { Module } from '@nestjs/common';
import { ProductOptionService } from './product-option.service';
import { ProductOptionController } from './product-option.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ProductOptionService, PrismaService],
  controllers: [ProductOptionController],
})
export class ProductOptionModule {}
