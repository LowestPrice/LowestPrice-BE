import { ConflictException, Injectable } from '@nestjs/common';
import { EmailRepository } from './email.repository';
import { ProductWithPrices } from './util/productWithPrices.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(
    private readonly emailRepository: EmailRepository,
    private readonly mailerService: MailerService
  ) {}

  //* 메일 발송 함수
  async sendEmail() {
    const mailList: ProductWithPrices[] =
      await this.emailRepository.getProductsWithLowerPrice();

    mailList.map(async (list: ProductWithPrices) => {
      await this.sendMailFormat(list);
    });

    return {
      success: 'success',
      status: 200,
      message: '메일 발송에 성공했습니다.',
    };
  }

  //* 메일 실제 발송
  async sendMailFormat(list: ProductWithPrices): Promise<void> {
    return await this.mailerService
      .sendMail({
        to: list.email, // 누구에게
        subject: `[내일은 최저가] ${list.productName} 상품이 최저가 입니다!`, // 제목
        // text: `[${list.productName}] 상품의 가격이 ${list.atPrice}(원) 에서 ${list.currentPrice}(원) 으로 현재 최저가 입니다.`, // 내용
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
            <h1 style="color: #007bff;">내일은 최저가</h1>
            <p style="font-size: 16px;"><strong>${
              list.productName
            }</strong> 상품의 가격이 <span style="color: #dc3545; font-weight: bold;">${list.currentPrice.toLocaleString()}(원)</span>으로 현재 최저가입니다.</p>
            <p style="font-size: 16px;">지금 바로 확인하려면 <a href="${
              list.productPartnersUrl
            }" style="color: #007bff; text-decoration: none; font-weight: bold;">여기를 클릭하세요</a>.</p>
          </div>
        </div>`,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        new ConflictException(err);
      });
  }
}
