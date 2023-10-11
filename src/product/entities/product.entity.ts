import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ProductEntity {
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @IsNotEmpty()
    coupangItemId: number;

    @IsNotEmpty()
    coupangVendorId: number;

    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsString()
    @IsNotEmpty()
    productImage: string;

    @IsInt()
    @IsNotEmpty()
    originalPrice: number;

    @IsInt()
    @IsNotEmpty()
    currentPrice: number;

    @IsOptional()
    @IsInt()
    discountRate?: number;

    @IsOptional()
    @IsInt()
    cardDiscount?: number;

    @IsString()
    @IsNotEmpty()
    productUrl: string;

    @IsString()
    @IsNotEmpty()
    productPartnersUrl: string;

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