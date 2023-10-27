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
      // request 객체에서 JWT를 추출하는 역할, refreshtoken이라는 이름으로 헤더에 담아서 보냄
      jwtFromRequest: (req) => {
        const token = req.headers.refreshtoken?.replace('Bearer ', '');
        console.log('Extracted Token:', token);
        return token;
      },
      // JWT의 유효기간을 무시할지 여부 - false 로 설정시, 유효기간은 확인됨.
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      //패스포트에서 req 객체에 접근할 수 있도록 설정 추가
      passReqToCallback: true,
    });
  }

  // JWT 검증 후, 추가적인 유효성검사 함수(payload에 담긴 userId로 검사)
  async validate(req, payload: { userId: number }, done: VerifiedCallback) {
    console.log("Payload: ", payload);
    
    const user = await this.authRepository.findUser(payload.userId);
    if (!user) {
      return done(
        new UnauthorizedException({ errMessage: '유효하지 않은 토큰입니다.' })
      );
    }
  
    // 요청에서 추출된 리프레시 토큰
    const requestToken = req.headers.refreshtoken?.replace('Bearer ', '');
  
    // DB에서 조회한 리프레시 토큰
    const existRefreshToken = await this.authRepository.findRefresh(payload.userId);
    
    // DB에서 조회한 토큰과 요청에서 추출된 토큰을 비교
    if (existRefreshToken.refreshToken !== requestToken) {
      return done(
        new UnauthorizedException({
          errMessage: '리프레시 토큰이 일치하지 않습니다.',
        })
      );
    }
  
    //passport 전략에서 사용자 인증 성공 시, req.user에 사용자 정보를 저장
    return done(null, user);
  }
}  
