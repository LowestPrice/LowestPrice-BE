import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ProductEntity {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsNotEmpty()
  realId: string;

  @IsNotEmpty()
  coupangItemId: string;

  @IsNotEmpty()
  coupangVendorId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  productImage: string;

  @IsInt()
  @IsNotEmpty()
  originalPrice: number;

  @IsOptional()
  @IsInt()
  currentPrice?: number;

  @IsOptional()
  @IsInt()
  discountRate?: number;

  @IsOptional()
  @IsInt()
  cardDiscount?: number;

  @IsString()
  @IsNotEmpty()
  productUrl: string;

  @IsOptional()
  @IsString()
  productPartnersUrl?: string;

  @IsNotEmpty()
  isOutOfStock: boolean;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @IsOptional()
  @IsDate()
  deletedAt?: Date | null;
}
