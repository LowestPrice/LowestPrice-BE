import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { userId: number }, done: VerifiedCallback) {
    console.log(payload);
    const user = await this.authService.findUser(payload.userId);
    if (!user) {
      return done(
        new UnauthorizedException({ errMessage: '유효하지 않은 토큰입니다.' })
      );
    }
    return done(null, user);
  }
}
