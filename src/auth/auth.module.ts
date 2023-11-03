import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { KakaoStrategy } from './kakao.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtConfigService } from 'src/common/config/jwt.config.service';
import { AuthRepository } from './auth.repository';
import { RefreshTokenStrategy } from './refresh.strategy';
import { TestKakaoStrategy } from './test-kakao.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtConfigService,
    KakaoStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    TestKakaoStrategy,
  ],
  exports: [JwtStrategy, JwtConfigService],
})
export class AuthModule {}
