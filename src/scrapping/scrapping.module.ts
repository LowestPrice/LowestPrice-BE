// src/scrapping/scrapping.module.ts

import { Module } from '@nestjs/common';
import { ScrappingService } from './scrapping.service';
import { ScrappingController } from './scrapping.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PartnersModule } from '../partners/partners.module'; // 추가
import { ShortenUrlService } from './shortenUrl.service';
import { ScrappingRepository } from './scrapping.repository';

@Module({
  imports: [PrismaModule, PartnersModule], // PartnersModule 추가
  providers: [ScrappingService, ShortenUrlService, ScrappingRepository],
  controllers: [ScrappingController],
})
export class ScrappingModule {}
