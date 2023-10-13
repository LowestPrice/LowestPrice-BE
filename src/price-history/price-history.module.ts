import { Module } from '@nestjs/common';
import { PriceHistoryService } from './price-history.service';
import { PriceHistoryController } from './price-history.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PriceHistoryService, PrismaService],
  controllers: [PriceHistoryController],
})
export class PriceHistoryModule {}
