import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { KakaoUser, KakaoUserAfterAuth } from './util/decorator/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService
  ) {}

  @UseGuards(AuthGuard('kakao'))
  @Get('/kakao-callback')
  async kakaoCallback(
    @KakaoUser() kakaoUser: KakaoUserAfterAuth,
    @Res({ passthrough: true }) res
  ): Promise<void> {
    //* db에서 사용자 생성
    const savedKakaoUser = await this.authService.createKakaoUser(kakaoUser);

    //* jwt 발급
    const jwtPayload = {
      userId: savedKakaoUser.userId, //! userId로 보내는게 괜찮은가 보안상 문제
    };

    const accessToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '5m',
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    await this.authService.saveRefresh(savedKakaoUser.userId, refreshToken);

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.json({ message: '로그인에 성공했습니다.' });
  }
}
