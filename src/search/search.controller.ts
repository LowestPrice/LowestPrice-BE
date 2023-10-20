import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  //* 상품 검색
  @Get('')
  async searchProducts(@Query('search') search: string): Promise<object> {
    return this.searchService.searchProduct(search);
  }

  //* 상품 검색 필터
  @Get(':filter')
  async searchProductsByFilter(
    @Query('search') search: string,
    @Param('filter') filter: string
  ): Promise<object> {
    return this.searchService.searchProductByFilter(search, filter);
  }
}
