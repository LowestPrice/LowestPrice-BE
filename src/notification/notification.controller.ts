import { Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationSevice: NotificationService) {}

  //! 로그인 jwt 구현되면 /user/:userId 경로는 삭제
  //* 알림 설정한 상품 조회
  @Get('/user/:userId')
  findAll(@Param('userId') userId: number): Promise<object> {
    return this.notificationSevice.findAll(userId);
  }

  //* 상품 알림 설정
  @Post('/user/:userId/product/:productId')
  setNotification(
    @Param('userId') userId: number,
    @Param('productId') productId: number
  ): Promise<object> {
    return this.notificationSevice.setNotification(userId, productId);
  }
}
