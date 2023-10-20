import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UploadedFile,
} from '@nestjs/common';
import { MypageService } from './mypage.service';
import { updateMypageDTO } from './dto/update.mypage.dto';

@Controller('mypage')
export class MypageController {
  constructor(private readonly mypageService: MypageService) {}

  @Get(':userId')
  async getMypageProfile(@Param('userId') userId: number): Promise<object> {
    return this.mypageService.getMypageProfile(userId);
  }

  @Put(':userId')
  async updateMypageProfile(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: number,
    @Body() updateMypageDTO
  ): Promise<object> {
    return this.mypageService.updateMypageProfile(
      userId,
      file,
      updateMypageDTO
    );
  }
}
