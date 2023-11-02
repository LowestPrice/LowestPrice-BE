import {
  Controller,
  Delete,
  Get,
  Req,
  Res,
  UseGuards,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { KakaoUser, KakaoUserAfterAuth } from './util/decorator/user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RefreshTokenGuard } from './refresh-auth.guard';
import { Response } from 'express';

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

  //* 로그아웃
  @Post('/kakao/logout')
  @UseGuards(JwtAuthGuard)
  async kakaoLogout(@Req() req: CustomRequest) {
    const userId: number = req.user.userId;
    return this.authService.deleteAccessRefreshToken(userId);
  }

  //* 회원탈퇴
  @Delete('/kakao/deactivate')
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
    //* 1. acessToken 발급, refreshToken 발급
    const { accessToken, refreshToken } =
      await this.authService.kakaoLogin(kakaoUser);

    //* query string 형태로 토큰 전송
    //const redirect_url = `${process.env.CLIENT_URL}/kakaologin?Authorization=${accessToken}&&refreshToken=${refreshToken}`;

    //* 토큰 쿠키로 전송
    res.cookie('Authorization', `Bearer ${accessToken}`, {
      domain: process.env.FRONT_HOST,
      httpOnly: false, // JavaScript에서 쿠키에 접근할 수 없도록 설정
      sameSite: 'none',
      secure: true,
      maxAge: 18000000, // 쿠키 만료 시간을 5시간으로 설정
    });

    res.cookie('refreshToken', `Bearer ${refreshToken}`, {
      domain: process.env.FRONT_HOST,
      httpOnly: false, // JavaScript에서 쿠키에 접근할 수 없도록 설정
      sameSite: 'none',
      secure: true,
      maxAge: 604800000, // 쿠키 만료 시간을 7일로 설정
    });

    const redirect_url = `${process.env.CLIENT_URL}`;
    console.log(redirect_url); // 백엔드에서 확인

    //* 2. 프론트로 redirect
    res.redirect(redirect_url);
  }

  // //* refresh 토큰 - 액세스토큰 재발급
  // @Post('/refresh')
  // @UseGuards(RefreshTokenGuard)
  // async refreshToken(@Req() req: CustomRequest): Promise<object> {
  //   console.log('유저확인', req.user);
  //   const userId: number = req.user.userId;
  //   return await this.authService.createNewAccessToken(userId);
  // }

  //* refresh 토큰 - 액세스토큰 재발급
  @Post('/refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Req() req: CustomRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    console.log('유저확인', req.user);
    const userId: number = req.user.userId;
    const { accessToken } = await this.authService.createNewAccessToken(userId);

    //newAccessToken을 쿠키로 전송
    res.cookie('Authorization', `Bearer ${accessToken}`, {
      httpOnly: false, // JavaScript에서 쿠키에 접근할 수 없도록 설정
      sameSite: 'none',
      secure: true,
      maxAge: 18000000, // 쿠키 만료 시간을 5시간으로 설정
    });
  }
}
