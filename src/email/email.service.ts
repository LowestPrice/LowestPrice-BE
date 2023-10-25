import { Injectable } from '@nestjs/common';
import { EmailRepository } from './email.repository';
import { ProductWithPrices } from './util/productWithPrices.interface';

@Injectable()
export class EmailService {
  constructor(private readonly emailRepository: EmailRepository) {}

  async sendEmail() {
    const mailList: ProductWithPrices[] =
      await this.emailRepository.getProductsWithLowerPrice();

    mailList.map(async (list: ProductWithPrices) => {
      await this.emailRepository.sendMail(list);
    });

    return {
      success: 'success',
      status: 200,
      message: '메일 발송에 성공했습니다.',
    };
  }
}
