import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class MypageEntity {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  phone?: number;

  @IsString()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  snsId: string;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  deletedAt?: Date | null;
}
