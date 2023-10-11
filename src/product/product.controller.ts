import { Controller, Get, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
// // Todo 유효성 검사 파이프 적용, DTO에 정의된 규칙에 맞는지 검사
// @UsePipes(new ValidationPipe())  
export class ProductController {
    constructor(private productService: ProductService) {}

    //* 상품 전체 조회 
    @Get()
    getAllProducts(): Promise<object> {
        return this.productService.getAllProducts();
    }

    //* 상품 상세 조회
    @Get('/:productId')
    getProductDetail(@Param('productId') productId: number) {
        return this.productService.getProductDetail(+productId);
    }
}
