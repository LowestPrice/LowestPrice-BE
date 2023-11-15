import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { OptionalJwtAuthGuard } from 'src/auth/option-jwt-auth.guard';

interface CustomRequest extends Request {
  user: {
    userId: number;
  };
}

@Controller('product')
// Todo 유효성 검사 파이프 적용, DTO에 정의된 규칙에 맞는지 검사
@UsePipes(new ValidationPipe())
export class ProductController {
  constructor(private productService: ProductService) {}

  //* 상품 랜덤 조회
  @Get('random')
  @UseGuards(OptionalJwtAuthGuard)
  async getRandomProducts(
    @Req() req: CustomRequest,
    @Query('isOutOfStock') isOutOfStock: string
  ) {
    const userId: number = req.user ? req.user.userId : null;

    return this.productService.getRandomProducts(userId, isOutOfStock);
  }

  //* 상품 전체 조회
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  getAllProducts(
    @Req() req: CustomRequest,
    @Query('isOutOfStock') isOutOfStock: string
  ): Promise<object> {
    const userId: number = req.user ? req.user.userId : null;

    return this.productService.getAllProducts(userId, isOutOfStock);
  }

  //* 상품 상위10개 조회
  @Get('top')
  @UseGuards(OptionalJwtAuthGuard)
  async getTopDiscountedProducts(@Req() req: CustomRequest): Promise<object> {
    // userId를 확인하는 이유는 상품 알림 여부를 확인하기 위함
    const userId: number = req.user ? req.user.userId : null;

    return this.productService.getTop10Products(userId);
  }

  //* 상품 카테고리별 조회
  @Get('category/:categoryName')
  @UseGuards(OptionalJwtAuthGuard)
  async getProductsByCategory(
    // 카테고리 이름
    @Param('categoryName') categoryName: string,
    // 페이지네이션을 위한 lastId
    @Query('lastId') lastIdString: string,
    // 품절 상품 조회 여부
    @Query('isOutOfStock') isOutOfStock: string,
    // userId를 가져오기 위해 req 객체를 전달
    @Req() req: CustomRequest
  ): Promise<object> {
    // req.user가 존재하면 userId를 가져오고, 그렇지 않으면 null 또는 undefined를 설정해 분기처리
    const userId: number = req.user ? req.user.userId : null;

    // lastId가 있으면 Number 형태로 변환, 없으면 null로 설정
    const lastId = Number(lastIdString) ? Number(lastIdString) : null;

    // 상품 카테고리별 조회
    const productList = await this.productService.getProductsByCategory(
      categoryName,
      userId,
      lastId,
      isOutOfStock
    );

    return productList;
  }

  //* 상품 카테고리별 필터기능 조회
  @Get('category/:categoryName/:filter')
  @UseGuards(OptionalJwtAuthGuard)
  async getProductsByCategoryAndFilter(
    @Param('categoryName') categoryName: string,
    @Param('filter') filter: string,
    @Query('lastId') lastIdString: string,
    @Query('isOutOfStock') isOutOfStock: string,
    @Req() req: CustomRequest
  ): Promise<object> {
    const userId: number = req.user ? req.user.userId : null;
    const lastId = Number(lastIdString) ? Number(lastIdString) : null;

    return this.productService.getProductsByCategoryAndFilter(
      categoryName,
      filter,
      lastId,
      userId,
      isOutOfStock
    );
  }

  //* 상품 상세 조회
  @Get(':productId')
  @UseGuards(OptionalJwtAuthGuard)
  async getProductDetail(
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: CustomRequest
  ): Promise<object> {
    const userId: number = req.user ? req.user.userId : null;

    const result = await this.productService.getProductDetail(
      productId,
      userId
    );

    return result;
  }

  //* 유사 상품 조회
  @Get(':productId/similar')
  @UseGuards(OptionalJwtAuthGuard)
  async getSimilarProducts(
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: CustomRequest
  ): Promise<object> {
    const userId: number = req.user ? req.user.userId : null;

    // productService에서 유사 상품을 가져오는 로직을 호출
    return this.productService.getSimilarProducts(productId, userId);
  }
}
