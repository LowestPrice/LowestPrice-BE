import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('')
  async searchProducts(@Query('search') search: string): Promise<object> {
    return this.searchService.searchProduct(search);
  }
}