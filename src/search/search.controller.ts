import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { OptionalJwtAuthGuard } from 'src/auth/option-jwt-auth.guard';

interface CustomRequest extends Request {
  user: {
    userId: number;
  };
}
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  //* 상품 검색
  @Get('')
  @UseGuards(OptionalJwtAuthGuard)
  async searchProducts(
    @Query('search') search: string,
    @Query('lastId') lastIdString: string,
    @Query('isOutOfStock') isOutOfStock: string,
    @Req() req: CustomRequest
  ): Promise<object> {
    // req.user가 존재하면 userId를 가져오고, 그렇지 않으면 null 또는 undefined를 설정해 분기처리
    const userId: number = req.user ? req.user.userId : null;

    const lastId = Number(lastIdString) ? Number(lastIdString) : null;

    return this.searchService.searchProduct(
      search,
      userId,
      lastId,
      isOutOfStock
    );
  }

  //* 상품 검색 필터
  @Get(':filter')
  @UseGuards(OptionalJwtAuthGuard)
  async searchProductsByFilter(
    @Query('search') search: string,
    @Param('filter') filter: string,
    @Query('lastId') lastIdString: string,
    @Query('isOutOfStock') isOutOfStock: string,
    @Req() req: CustomRequest
  ): Promise<object> {
    const userId: number = req.user ? req.user.userId : null;

    const lastId = Number(lastIdString) ? Number(lastIdString) : null;

    return this.searchService.searchProductByFilter(
      search,
      filter,
      userId,
      lastId,
      isOutOfStock
    );
  }
}
