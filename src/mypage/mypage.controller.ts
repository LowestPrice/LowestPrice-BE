import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MypageService } from './mypage.service';
import { UpdateMypageDTO } from './dto/update.mypage.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

interface CustomRequest extends Request {
  user: {
    userId: number;
  };
}

@Controller('mypage')
export class MypageController {
  constructor(private readonly mypageService: MypageService) {}

  //* 마이페이지 프로필 조회
  @Get('')
  @UseGuards(JwtAuthGuard)
  async getMypageProfile(@Req() req: CustomRequest): Promise<object> {
    const userId: number = req.user.userId;
    return this.mypageService.getMypageProfile(userId);
  }

  //* 마이페이지 프로필 업데이트
  @Put('')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateMypageProfile(
    @UploadedFile() file: Express.Multer.File,
    // @Param('userId') userId: number,
    @Req() req: CustomRequest,
    @Body() updateMypageDTO: UpdateMypageDTO
  ): Promise<object> {
    console.log(updateMypageDTO);
    const userId: number = req.user.userId;

    return this.mypageService.updateMypageProfile(
      userId,
      file,
      updateMypageDTO
    );
  }
}
