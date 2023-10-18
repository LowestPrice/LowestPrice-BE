import { IsDate, IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class Magazine {
  @IsString()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  //* multer 사용시 수정
  mainImage: string;

  @IsDate()
  createdAt: string;

  @IsDate()
  updatedAt: string;

  @IsDate()
  deletedAt: string | null;
}
