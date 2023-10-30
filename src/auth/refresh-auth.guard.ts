import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class RefreshTokenGuard extends AuthGuard('refresh-jwt') {
    canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.refreshtoken?.replace('Bearer ', '');
    console.log(request);
    console.log('리프레시 토큰', token);

    // 토큰이 있을 때에만 검증 수행
    if (token) {
      request.token = token; // 요청 객체에 토큰 추가 (옵션)
      return super.canActivate(context);
    }

    // 토큰이 없을 때는 검증을 수행하지 않음
    return true;
  }
}