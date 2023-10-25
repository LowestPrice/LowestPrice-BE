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
    const userId: number = req.user ? req.user.userId : null;

    return this.productService.getTop10Products(userId);
  }

  //* 상품 카테고리별 조회
  @Get('category/:categoryName')
  @UseGuards(OptionalJwtAuthGuard)
  async getProductsByCategory(
    @Param('categoryName') categoryName: string,
    @Query('isOutOfStock') isOutOfStock: string,
    @Req() req: CustomRequest
  ): Promise<object> {
    // req.user가 존재하면 userId를 가져오고, 그렇지 않으면 null 또는 undefined를 설정해 분기처리
    const userId: number = req.user ? req.user.userId : null;

    return this.productService.getProductsByCategory(
      categoryName,
      userId,
      isOutOfStock
    );
  }

  //* 상품 카테고리별 필터기능 조회
  @Get('category/:categoryName/:filter')
  @UseGuards(OptionalJwtAuthGuard)
  async getProductsByCategoryAndFilter(
    @Param('categoryName') categoryName: string,
    @Param('filter') filter: string,
    @Query('isOutOfStock') isOutOfStock: string,
    @Req() req: CustomRequest
  ): Promise<object> {
    const userId: number = req.user ? req.user.userId : null;
    return this.productService.getProductsByCategoryAndFilter(
      categoryName,
      filter,
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
}
