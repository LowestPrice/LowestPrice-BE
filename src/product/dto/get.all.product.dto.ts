import { PickType } from '@nestjs/swagger';
import { ProductEntity } from '../entities/product.entity';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class GetProductDTO extends PickType(ProductEntity, [
  'productId',
  'coupangItemId',
  'coupangVendorId',
  'productName',
  'productImage',
  'isOutOfStock',
  'originalPrice',
  'currentPrice',
  'discountRate',
  'cardDiscount',
  'createdAt',
  'updatedAt',
]) {
    category: {
        categoryId: number;
        categoryName: string;
    }
}
