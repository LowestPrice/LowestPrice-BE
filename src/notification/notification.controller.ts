import { Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationSevice: NotificationService) {}

  //* 상품 알림 설정
  @Post('/user/:userId/product/:productId')
  setNotification(
    @Param('userId') userId: number,
    @Param('productId') productId: number
  ): Promise<object> {
    return this.notificationSevice.setNotification(userId, productId);
  }
}
