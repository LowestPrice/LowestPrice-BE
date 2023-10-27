//src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { AuthRepository } from './auth.repository';

//* JWT 토큰을 이용한 전략 구현
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: { userId: number }, done: VerifiedCallback) {
    // console.log('JWT Validate Payload:', payload);
    const user = await this.authRepository.findUser(payload.userId);
    if (!user) {
      return done(
        new UnauthorizedException({ errMessage: '유효하지 않은 토큰입니다.' })
      );
    }
    return done(null, user);
  }
}
