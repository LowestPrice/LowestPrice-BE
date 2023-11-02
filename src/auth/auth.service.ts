import { Injectable } from '@nestjs/common';
import { KakaoUserAfterAuth } from './util/decorator/user.decorator';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService
  ) {}

  //* jwt 로그인 확인
  async findUser(id: number) {
    return this.authRepository.findUser(id);
  }

  //* 카카오 로그인
  async kakaoLogin(kakaoUser: KakaoUserAfterAuth) {
    // 1. DB에 해당 사용자 존재 여부 확인
    let isExistKaKaoUser = await this.authRepository.findKakaoUser(
      kakaoUser.snsId
    );

    // 2. 사용자 하지 않을 경우 DB에 계정 생성
    if (!isExistKaKaoUser) {
      isExistKaKaoUser = await this.authRepository.createKakaoUser(kakaoUser);
    }

    // 3. jwt 발급
    const jwtPayload = {
      userId: isExistKaKaoUser.userId,
    };

    // 3-1. access 토큰 발급
    const accessToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '5h',
      secret: process.env.JWT_SECRET,
    });

    // 3-2. refresh 토큰 발급
    const refreshToken = this.jwtService.sign(jwtPayload, {
      // 리프레시 토큰 유효기간을 길게 설정하고 액세스 토큰이 만료되면 리프레시 토큰을 사용해 액세스 토큰을 재발급하는 방식
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    // 4. refresh 토큰 DB에 저장
    try {
      await this.authRepository.saveRefresh(
        isExistKaKaoUser.userId,
        refreshToken
      );
    } catch (err) {
      console.error('refresh 토큰 저장 실패');
    }

    //*! 기존의 쿠키 방식
    //res.setHeader('Authorization', `Bearer ${accessToken}`);
    //res.cookie('Authorization', `Bearer ${accessToken}`, {
    //  httpOnly: false, // JavaScript에서 쿠키에 접근할 수 없도록 설정
    //  sameSite: 'none',
    //  secure: true,
    //  maxAge: 36000000, // 쿠키 만료 시간 설정 (예: 1시간)
    //});
    return { accessToken, refreshToken };
  }

  //* 리프레시 - 액세스 토큰 재발급
  async createNewAccessToken(userId: number) {
    const jwtPayload = {
      userId: userId,
    };

    const newAccessToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '5h',
      secret: process.env.JWT_SECRET,
    });

    return { accessToken: newAccessToken };
  }

  //* 회원 탈퇴
  async kakaoDeactivate(userId: number) {
    const user: User = await this.authRepository.kakaoDeactivate(userId);
    const unlink_res = await axios.post(
      process.env.KAKAO_UNLINK_URI,
      {
        target_id_type: 'user_id',
        target_id: Number(user.snsId),
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `KakaoAK ${process.env.SERVICE_APP_ADMIN_KEY}`,
        },
      }
    );
    return {
      success: 'success',
      status: 200,
      message: '회원 탈퇴에 성공했습니다.',
    };
  }

  //* 로그아웃
  async deleteAccessRefreshToken(userId: number) {
    const user: User = await this.authRepository.deleteRefreshToken(userId);
    // console.log(`로그아웃1`);
    // const unlink_res = await axios.get(
    //   `https://kauth.kakao.com/oauth/logout?client_id=${process.env.KAKAO_CLIENT_ID}&logout_redirect_uri=${process.env.KAKAO_LOGOUT_URL}`
    // );

    // console.log(`로그아웃2`);
    const unlink_res = await axios.post(
      process.env.KAKAO_LOGOUT_URL,
      {
        target_id_type: 'user_id',
        target_id: Number(user.snsId),
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `KakaoAK ${process.env.SERVICE_APP_ADMIN_KEY}`,
        },
      }
    );

    return {
      success: 'success',
      status: 200,
      message: '로그아웃에 성공했습니다.',
    };
  }
}
