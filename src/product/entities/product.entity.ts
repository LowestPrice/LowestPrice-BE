import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ProductEntity {
    @IsNumber()
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

    @IsNumber()
    @IsNotEmpty()
    originalPrice: number;

    @IsNumber()
    @IsNotEmpty()
    currentPrice: number;

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

    @IsDate()
    deletedAt: Date | null;
}