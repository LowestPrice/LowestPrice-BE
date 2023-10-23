import { HttpException, HttpStatus, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MagazineController } from './magazine.controller';
import { MagazineService } from './magazine.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => {
        return {
          fileFilter: (request, file, callback) => {
            if (file.mimetype.match(/\/(jpg|jpeg|png)$/i)) {
              // 이미지 형식은 jpg, jpeg, png만 허용합니다.
              callback(null, true);
            } else {
              callback(
                new HttpException(
                  {
                    message: 1,
                    error: '지원하지 않는 이미지 형식입니다.',
                  },
                  HttpStatus.BAD_REQUEST
                ),
                false
              );
            }
          },
          limits: {
            fieldNameSize: 200, // 필드명 사이즈 최대값 (기본값 100bytes)
            filedSize: 1024 * 1024, // 필드 사이즈 값 설정 (기본값 1MB)
            fields: 3, // 파일 형식이 아닌 필드의 최대 개수 (기본 값 무제한)
            fileSize: 10777216, //multipart 형식 폼에서 최대 파일 사이즈(bytes) "16MB 설정" (기본 값 무제한)
            files: 1, //multipart 형식 폼에서 파일 필드 최대 개수 (기본 값 무제한)
          },
        };
      },
    }),
    PrismaModule,
  ],
  controllers: [MagazineController],
  providers: [MagazineService],
})
export class MagazineModule {}
