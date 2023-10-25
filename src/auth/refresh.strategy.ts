import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt'
) {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService
  ) {
    super({
      // 프론트에서 리프레시 토큰을 사용하여 액세스 토큰을 재발급요청 보낼 때, 요청 본문에 담아서 보냄
      // 예시, {'refreshToken': '리프레시토큰값'}
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      // JWT의 유효기간을 무시할지 여부 - false 로 설정시, 유효기간은 확인됨.
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
    });
  }

  // JWT 검증 후, 추가적인 유효성검사 함수(payload에 담긴 userId로 검사)
  async validate(payload: { userId: number }, done: VerifiedCallback) {
    const user = await this.authRepository.findUser(payload.userId);
    if (!user) {
      return done(
        new UnauthorizedException({ errMessage: '유효하지 않은 토큰입니다.' })
      );
    }
    // passport 전략에서 사용자 인증 성공 시, req.user에 사용자 정보를 저장
    return done(null, user);
  }
}
