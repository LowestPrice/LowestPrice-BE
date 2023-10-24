import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    // 토큰이 있을 때에만 검증 수행
    if (token) {
      request.token = token; // 요청 객체에 토큰 추가 (옵션)
      return super.canActivate(context);
    }

    // 토큰이 없을 때는 검증을 수행하지 않음
    return true;
  }
}
