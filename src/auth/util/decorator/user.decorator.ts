import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const KakaoUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

export interface KakaoUserAfterAuth {
  email: string | null;
  snsId: string;
  nickname: string;
  provider: string;
  image: string;
}
