import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { KakaoUser, KakaoUserAfterAuth } from './util/decorator/user.decorator';

@Controller('')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService
  ) {}

  @Get('/login')
  async test(@Res({ passthrough: true }) res) {
    const id: number = 37;
    const jwtPayload = {
      userId: id, //! userId로 보내는게 괜찮은가 보안상 문제
    };

    const accessToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '5h',
      secret: process.env.JWT_SECRET,
    });

    res.cookie('Authorization', `Bearer ${accessToken}`, {
      httpOnly: false, // JavaScript에서 쿠키에 접근할 수 없도록 설정
      //secure: process.env.NODE_ENV !== 'development', // HTTPS에서만 쿠키 전송
      //sameSite: 'none',
      sameSite: 'lax',
      secure: false,
      maxAge: 3600000, // 쿠키 만료 시간 설정 (예: 1시간)
    });

    console.log(accessToken);
    return { message: 'test성공' };
  }

  //! callback url로 지정
  @UseGuards(AuthGuard('kakao'))
  @Get('/api/kakao/callback')
  async kakaoCallback(
    @KakaoUser() kakaoUser: KakaoUserAfterAuth,
    @Res({ passthrough: true }) res
  ): Promise<void> {
    //! service 단으로 이동해서 정리해야함

    //* db에 사용자가 있는지 확인
    let isExistKaKaoUser = await this.authService.findKakaoUser(
      kakaoUser.snsId
    );
    if (!isExistKaKaoUser) {
      isExistKaKaoUser = await this.authService.createKakaoUser(kakaoUser);
    }

    //* jwt 발급
    const jwtPayload = {
      userId: isExistKaKaoUser.userId, //! userId로 보내는게 괜찮은가 보안상 문제
    };

    const accessToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '5h',
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    await this.authService.saveRefresh(isExistKaKaoUser.userId, refreshToken);

    //*! 프론트랑 연결 될 수 있게 옵션 설정 잘 해줘야함
    // res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.cookie('Authorization', `Bearer ${accessToken}`, {
      httpOnly: false, // JavaScript에서 쿠키에 접근할 수 없도록 설정
      //secure: process.env.NODE_ENV !== 'development', // HTTPS에서만 쿠키 전송
      //sameSite: 'none',
      sameSite: 'lax',
      secure: false,
      maxAge: 3600000, // 쿠키 만료 시간 설정 (예: 1시간)
    });

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true, // JavaScript에서 쿠키에 접근할 수 없도록 설정
    //   //secure: process.env.NODE_ENV !== 'development', // HTTPS에서만 쿠키 전송
    //   sameSite: 'none',
    //   secure: false,
    //   maxAge: 3600000, // 쿠키 만료 시간 설정 (예: 1시간)
    // });


    res.redirect(`${process.env.CLIENT_URL}`); //! 프론트 url & 리다이렉트 해야 쿠키가 넘어감
    // res.json({ message: '로그인에 성공했습니다.' });
  }
}
