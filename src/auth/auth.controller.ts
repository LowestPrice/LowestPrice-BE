import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
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
  @Get('/kakao/withdrawal')
  @UseGuards(JwtAuthGuard)
  async kakaoWithDrawal(@Req() req: CustomRequest) {
    const userId: number = req.user.userId;
    return this.authService.kakaoWithDrawal(userId);
  }

  //! callback url로 지정
  @UseGuards(AuthGuard('kakao'))
  @Get('/api/kakao/callback')
  async kakaoCallback(
    @KakaoUser() kakaoUser: KakaoUserAfterAuth,
    @Res({ passthrough: true }) res
  ): Promise<void> {
    //* db에 사용자가 있는지 확인
    let isExistKaKaoUser = await this.authService.findKakaoUser(
      kakaoUser.snsId
    );
    if (!isExistKaKaoUser) {
      isExistKaKaoUser = await this.authService.createKakaoUser(kakaoUser);
    }

    //* jwt 발급
    const jwtPayload = {
      userId: isExistKaKaoUser.userId,
    };

    const accessToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '5h',
      secret: process.env.JWT_SECRET,
    });

    console.log(`jwt-accessToken: ${accessToken}`);

    //*! 기존의 쿠키 방식
    //res.setHeader('Authorization', `Bearer ${accessToken}`);
    //res.cookie('Authorization', `Bearer ${accessToken}`, {
    //  httpOnly: false, // JavaScript에서 쿠키에 접근할 수 없도록 설정
    //  sameSite: 'none',
    //  secure: true,
    //  maxAge: 36000000, // 쿠키 만료 시간 설정 (예: 1시간)
    //});

    const redirect_url = `${process.env.CLIENT_URL}/kakaologin?Authorization=${accessToken}`;
    console.log(redirect_url); // 백엔드에서 확인
    res.redirect(redirect_url);
  }
}
