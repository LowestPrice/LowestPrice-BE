import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MagazineModule } from './magazine/magazine.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { NotificationModule } from './notification/notification.module';
import { PartnersModule } from './partners/partners.module';
import { ScheduleModule } from '@nestjs/schedule'; // 추가
import { ScrappingModule } from './scrapping/scrapping.module';
import { PriceHistoryModule } from './price-history/price-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    ScrappingModule,
    ProductModule,
    MagazineModule,
    PartnersModule,
    NotificationModule,
    PriceHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
