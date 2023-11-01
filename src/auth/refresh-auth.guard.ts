import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class RefreshTokenGuard extends AuthGuard('refresh-jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // 이전 방법 - 헤더에서 토큰을 가져옵니다.
    // const token = request.headers.refreshtoken?.replace('Bearer ', '');
    // 쿠키에서 리프레시 토큰을 가져옵니다. main.ts에 cookie-parser 설정
    const token = request.cookies?.refreshToken?.replace('Bearer ', '');
    console.log('리프레시 토큰', token);

    // 토큰이 있을 때에만 검증 수행
    if (token) {
      request.token = token; // 요청 객체에 토큰 추가 (옵션)
      return super.canActivate(context);
    }

    // 토큰이 쿠키에 없을 때는 검증을 수행하지 않음
    return false; // true 에서 false 로 변경, 토큰이 없으면 가드가 동작하지 않도록 설정
  }
}
