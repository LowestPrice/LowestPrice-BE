import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { KakaoStrategy } from './kakao.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { sign } from 'crypto';
import { JwtConfigService } from 'src/config/jwt.config.service';

@Module({
  imports: [JwtModule.registerAsync({
    useClass: JwtConfigService
  }), PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, JwtConfigService, KakaoStrategy, JwtStrategy],
  exports: [JwtStrategy, JwtConfigService]
})
export class AuthModule {}
