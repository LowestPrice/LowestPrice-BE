import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { KakaoUser, KakaoUserAfterAuth } from './util/decorator/user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
//! 파일로 분리
interface CustomRequest extends Request {
  user: {
    userId: number;
  };
}
@Controller('')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService
  ) {}

  //* 회원탈퇴
  @Get('/kakao/deactivate')
  @UseGuards(JwtAuthGuard)
  async kakaoDeactivate(@Req() req: CustomRequest) {
    const userId: number = req.user.userId;
    return await this.authService.kakaoDeactivate(userId);
  }

  //! callback url로 지정
  @UseGuards(AuthGuard('kakao'))
  @Get('/api/kakao/callback')
  async kakaoCallback(
    @KakaoUser() kakaoUser: KakaoUserAfterAuth,
    @Res({ passthrough: true }) res
  ): Promise<void> {
    //* 1. acessToken 발급
    const accessToken = await this.authService.kakaoLogin(kakaoUser);
    const redirect_url = `${process.env.CLIENT_URL}/kakaologin?Authorization=${accessToken}`;
    console.log(redirect_url); // 백엔드에서 확인

    //* 2. 프론트로 redirect
    res.redirect(redirect_url);
  }

  //* refresh 토큰 - 액세스토큰 재발급
  
  
}
