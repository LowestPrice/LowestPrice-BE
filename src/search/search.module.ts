import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchRepository } from './search.repository';

@Module({
  controllers: [SearchController],
  providers: [PrismaService, SearchService, SearchRepository],
})
export class SearchModule {}
