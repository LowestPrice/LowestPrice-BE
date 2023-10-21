import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MagazineModule } from './magazine/magazine.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { NotificationModule } from './notification/notification.module';
import { PriceHistoryModule } from './price-history/price-history.module';
import { AuthModule } from './auth/auth.module';
import { ProductOptionController } from './product-option/product-option.controller';
import { ProductOptionService } from './product-option/product-option.service';
import { ProductOptionModule } from './product-option/product-option.module';
import { SearchModule } from './search/search.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { MypageModule } from './mypage/mypage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ProductModule,
    MagazineModule,
    NotificationModule,
    PriceHistoryModule,
    AuthModule,
    ProductOptionModule,
    SearchModule,
    MypageModule,
  ],
  controllers: [AppController, ProductOptionController],
  providers: [AppService, ProductOptionService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
