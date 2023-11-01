// social-kakao-strategy.ts

import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL, //리다이렉트 url
      scope: ['account_email', 'profile_nickname', 'profile_image'], //* 이메일은 필수 x
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function
  ) {
    // 카카오에서 제공하는 토근 & 사용자 정보
    console.log('accessToken: ', accessToken);
    console.log('refreshToken: ', refreshToken);
    console.log(profile);

    const user = {
      email: profile._json.kakao_account.email || null,
      snsId: String(profile.id),
      nickname: profile.displayName,
      provider: profile.provider,
      image: profile._json.properties.profile_image,
    };

    done(null, user);
  }
}
