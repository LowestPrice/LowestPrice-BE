import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MagazineController } from './magazine.controller';
import { MagazineService } from './magazine.service';

@Module({
  imports: [PrismaModule],
  controllers: [MagazineController],
  providers: [MagazineService],
})
export class MagazineModule {}
