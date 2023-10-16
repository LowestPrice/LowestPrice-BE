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
import { ProductOptionController } from './product-option/product-option.controller';
import { ProductOptionService } from './product-option/product-option.service';
import { ProductOptionModule } from './product-option/product-option.module';

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
    ProductOptionModule,
  ],
  controllers: [AppController, ProductOptionController],
  providers: [AppService, ProductOptionService],
})
export class AppModule {}
