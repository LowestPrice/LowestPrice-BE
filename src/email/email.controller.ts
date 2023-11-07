import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';
import { Cron } from '@nestjs/schedule';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Cron('0 30 11,20 * * *') // 매일 오전 11시 30분과 오후 8시 30분에 실행
  async sendEmail() {
    return this.emailService.sendEmail();
  }

  @Get('test')
  async sendNotification() {
    return this.emailService.sendNotification();
  }
}
