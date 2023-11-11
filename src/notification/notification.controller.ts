import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedExceptionFilter } from 'src/auth/util/decorator/not-user.decorator';

interface CustomRequest extends Request {
  user: {
    userId: number;
  };
}

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationSevice: NotificationService) {}

  //* 알림 설정한 상품 조회
  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  findAll(@Req() req: CustomRequest): Promise<object> {
    const userId: number = req.user.userId;
    return this.notificationSevice.findAll(userId);
  }

  //* 상품 알림 설정
  @Post('/product/:productId')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  setNotification(
    @Req() req: CustomRequest,
    @Param('productId') productId: number
  ): Promise<object> {
    const userId: number = req.user.userId;
    return this.notificationSevice.setNotification(userId, productId);
  }

  //* 알림 내역 조회
  @Get('/history')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  getNotification(@Req() req: CustomRequest): Promise<object> {
    const userId: number = req.user.userId;
    return this.notificationSevice.getNotification(userId);
  }

  //* 알림 내역 삭제
  @Delete('/history/:alarmHistoryId')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  removeNotification(
    @Req() req: CustomRequest,
    @Param('alarmHistoryId') alarmHistoryId: number
  ): Promise<object> {
    const userId: number = req.user.userId;
    return this.notificationSevice.removeNotification(userId, alarmHistoryId);
  }
}
