import { PickType } from "@nestjs/swagger";
import { ProductEntity } from "../entities/product.entity";


export class getProductDTO extends PickType( ProductEntity, [
    'productId',
    'coupangItemId',
    'coupangVendorId',
    'productName',
    'productImage',
    'isOutOfStock',
    'originalPrice',
    'currentPrice',
    'discountRate',
    'cardDiscount'
]) {}


