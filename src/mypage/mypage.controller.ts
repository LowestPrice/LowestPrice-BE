import { Controller, Get, Param } from '@nestjs/common';
import { MypageService } from './mypage.service';

@Controller('mypage')
export class MypageController {
  constructor(private readonly mypageService: MypageService) {}

  @Get(':userId')
  async getMypageProfile(@Param('userId') userId: number): Promise<object> {
    return this.mypageService.getMypageProfile(userId);
  }
}
