// src/scrapping/scrapping.module.ts

import { Module } from '@nestjs/common';
import { ScrappingService } from './scrapping.service';
import { ScrappingController } from './scrapping.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PartnersModule } from '../partners/partners.module'; // 추가

@Module({
  imports: [PrismaModule, PartnersModule], // PartnersModule 추가
  providers: [ScrappingService],
  controllers: [ScrappingController],
})
export class ScrappingModule {}
