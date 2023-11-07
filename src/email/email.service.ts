import { ConflictException, Injectable } from '@nestjs/common';
import { EmailRepository } from './email.repository';
import {
  KaKaoTemplate,
  ProductWithPrices,
} from './util/productWithPrices.interface';
import { MailerService } from '@nestjs-modules/mailer';
import axios from 'axios';

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

  //* 카카오 알림톡 발송
  async sendKakaoFormat(list: KaKaoTemplate, token: string): Promise<void> {
    try {
      const kakaoAlim = await axios.post(
        `${process.env.KAKAO_ALIM_HOST}/v2/kko/sendAlimTalk `,
        {
          msgIdx: '1',
          countryCode: '82',
          resMethod: 'PUSH',
          senderKey: process.env.KAKAO_ALIM_KEY,
          tmpltCode: 'lowest-price-01',
          message: `${list.nickname}님 안녕하세요!\n\n내일은 최저가에서 알림 설정하신 [${list.productName}]의 최저가 알림을 보내드립니다.\n\n■ 상품 : ${list.productName}\n■ 가격 : ${list.currentPrice}\n\n※ 해당 메시지는 고객님께서 요청하신 최저가 알림이 있을 경우 발송됩니다.`,
          recipient: list.phone,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'bt-token': token,
          },
        }
      );
      console.log(kakaoAlim);
    } catch (err) {
      console.log(err);
    }
  }

  // 카카오톡 알림 발송
  async sendNotification() {
    // 비즈톡 연결
    let token: string;
    try {
      const res = await axios.post(
        `${process.env.KAKAO_ALIM_HOST}/v2/auth/getToken`,
        {
          bsid: process.env.KAKAO_ALIM_ID,
          passwd: process.env.KAKAO_ALIM_PWD,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      token = res.data.token;
    } catch (err) {
      console.log(err);
    }

    // DB 데이터 조회
    const alimList: KaKaoTemplate[] =
      await this.emailRepository.getProductsWithLowerPriceKaKao();

    // DB 조회 결과로 카카오 알림 발송
    alimList.map(async (list: KaKaoTemplate) => {
      await this.sendKakaoFormat(list, token);
    });

    // try {
    //   const kakaoAlim = await axios.post(
    //     `${process.env.KAKAO_ALIM_HOST}/v2/kko/sendAlimTalk `,
    //     {
    //       msgIdx: '1',
    //       countryCode: '82',
    //       resMethod: 'PUSH',
    //       senderKey: process.env.KAKAO_ALIM_KEY,
    //       tmpltCode: 'lowest-price-01',
    //       message: `test님 안녕하세요!\n\n내일은 최저가에서 알림 설정하신 #{상품}의 최저가 알림을 보내드립니다.\n\n■ 상품 : test\n■ 가격 : test\n\n※ 해당 메시지는 고객님께서 요청하신 최저가 알림이 있을 경우 발송됩니다.`,
    //       recipient: 'phone number',
    //     },
    //     {
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'bt-token': token,
    //       },
    //     }
    //   );
    //   console.log(kakaoAlim);
    // } catch (err) {
    //   console.log(err);
    // }

    return {
      success: 'success',
      status: 200,
      message: '카톡 알림 발송에 성공했습니다.',
    };
  }
}
