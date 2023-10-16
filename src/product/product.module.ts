import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductRepository } from './product.repository';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, PrismaClient],
})
export class ProductModule {}
