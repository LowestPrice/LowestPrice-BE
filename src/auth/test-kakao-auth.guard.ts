
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TestKakaoAuthGuard extends AuthGuard('test-kakao') {}
