import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { OptionalJwtAuthGuard } from 'src/auth/option-jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface CustomRequest extends Request {
  user: {
    userId: number;
  };
}

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  //* 상품 검색
  @ApiOperation({
    summary: '상품 검색',
    description:
      '이 API는 선택적으로 인증 받습니다. 인증된 사용자는 상품 알림 여부를 확인할 수 있습니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '상품 검색 성공'})
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰입니다.'})
  @ApiResponse({ status: 404, description: '검색어가 포함된 상품이 없습니다.'})
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
  @ApiOperation({
    summary: '상품 검색 필터',
    description:
      '이 API는 선택적으로 인증 받습니다. 인증된 사용자는 상품 알림 여부를 확인할 수 있습니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '상품 검색 필터 성공'})
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰입니다.'})
  @ApiResponse({ status: 404, description: '검색어가 포함된 상품이 없습니다.'})
  @ApiResponse({ status: 404, description: '검색 필터가 존재하지 않습니다.'})
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
