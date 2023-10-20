import { Module } from '@nestjs/common';
import { MypageController } from './mypage.controller';
import { MypageService } from './mypage.service';
import { MypageRepository } from './mypage.repository';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MypageController],
  providers: [MypageService, MypageRepository, PrismaClient],
})
export class MypageModule {}
