import { Controller, Get, Logger } from '@nestjs/common';
import { ScrappingService } from './scrapping.service';
import { Cron } from '@nestjs/schedule';
import { ShortenUrlService } from './shortenUrl.service';

@Controller('scrapping')
export class ScrappingController {
  constructor(
    private readonly scrappingService: ScrappingService,
    private readonly shortenUrlService: ShortenUrlService
  ) {}
  private readonly logger = new Logger(ScrappingService.name);

  // Cron 표현식을 사용하여 매일 점심 12시와 저녁 6시에 작동하도록 설정합니다.
  @Cron('0 12,17 * * *')
  async handleCron() {
    // 로깅을 통해 언제 Cron 작업이 실행되는지 추적합니다.
    this.logger.debug(
      'Cron job for Products Update is triggered at 12:00 PM and 6:00 PM every day'
    );
    // 스크래핑 로직을 실행합니다.
    this.startScrapping();
  }
  @Cron('0 23 * * *')
  async handleUpdateShortenUrlsCron() {
    this.logger.debug(
      'Cron job for updateShortenUrls is triggered at 6:00 PM every day'
    );
    this.updateShortenUrls(); // await를 제거하여 병렬 실행
  }

  @Get('start')
  async startScrapping() {
    console.log('GET 요청이 /scrapping/start로 들어왔습니다.');
    return await this.scrappingService.startScrapping();
  }

  @Get('updateURL')
  async updateShortenUrls() {
    console.log('GET 요청이 /scrapping/updateShortenUrls로 들어왔습니다.');
    return await this.shortenUrlService.updateShortenUrls();
  }
}
