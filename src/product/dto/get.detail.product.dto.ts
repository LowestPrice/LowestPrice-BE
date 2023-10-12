import { PickType } from "@nestjs/swagger";
import { ProductEntity } from "../entities/product.entity";
import { IsArray, IsInt, IsNotEmpty, IsString, Validate, ValidateNested } from "class-validator";

// export class GetProductCategoryDto {
//     @IsInt()
//     categoryId: number;

//     @IsString()
//     name: string;
// }

export class GetOneProductDto extends PickType(ProductEntity, [
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
    'productUrl',
    'productPartnersUrl',
]) {
    @IsArray()
    categoryId: number[];

    @IsString()
    @IsArray()
    categoryName: string[];
}