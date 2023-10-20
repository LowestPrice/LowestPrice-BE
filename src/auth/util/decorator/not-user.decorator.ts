import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    response.status(401).json({
      success: false,
      statusCode: 401,
      errorMessage: '로그인 후 이용 가능합니다.', // 원하는 에러 메시지로 변경할 수 있습니다.
    });
  }
}
