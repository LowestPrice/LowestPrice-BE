import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateHmac } from './hmacGenerator';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs'; // 추가된 import

@Injectable()
export class PartnersService {
  private readonly logger = new Logger(PartnersService.name);
  private readonly accessKey: string;
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.accessKey = this.configService.get<string>('COUPANG_ACCESS_KEY');
    this.secretKey = this.configService.get<string>('COUPANG_SECRET_KEY');

    if (!this.accessKey || !this.secretKey) {
      this.logger.error(`Missing configuration for Coupang API.`);
      throw new HttpException(
        'Missing Configuration',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getShortenUrl(coupangUrl: string): Promise<string> {
    try {
      const REQUEST_METHOD = 'POST';
      const URL = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';
      const DOMAIN = 'https://api-gateway.coupang.com';

      const authorization = generateHmac(
        REQUEST_METHOD,
        URL,
        this.secretKey,
        this.accessKey
      );

      const response$ = this.httpService.post(
        `${DOMAIN}${URL}`,
        {
          coupangUrls: [coupangUrl],
        },
        {
          headers: { Authorization: authorization },
        }
      );

      const response = await firstValueFrom(response$); // 수정된 부분

      if (
        response.data &&
        response.data.data[0] &&
        response.data.data[0].shortenUrl
      ) {
        return response.data.data[0].shortenUrl;
      } else {
        this.logger.error(
          `Unexpected API response: ${JSON.stringify(response.data)}`
        );
        throw new HttpException(
          'Unexpected API Response',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `API request failed: ${error.message}`,
          JSON.stringify(error.response?.data)
        );
      } else {
        this.logger.error(`API request failed: ${error.message}`, error.stack);
      }
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
