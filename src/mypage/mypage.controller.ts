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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface CustomRequest extends Request {
  user: {
    userId: number;
  };
}

@ApiTags('mypage')
@Controller('mypage')
export class MypageController {
  constructor(private readonly mypageService: MypageService) {}

  //* 마이페이지 프로필 조회
  @ApiOperation({
    summary: '마이페이지 프로필 조회',
    description: '이 API는 인증이 필요합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '마이페이지 프로필 조회 성공'})
  @ApiResponse({ status: 401, description: '로그인 후 이용 가능합니다.'})
  @Get('')
  @UseGuards(JwtAuthGuard)
  async getMypageProfile(@Req() req: CustomRequest): Promise<object> {
    const userId: number = req.user.userId;
    return this.mypageService.getMypageProfile(userId);
  }

  //* 마이페이지 프로필 업데이트
  @ApiOperation({
    summary: '마이페이지 프로필 업데이트',
    description: '이 API는 인증이 필요합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '마이페이지 프로필 업데이트 성공'})
  @ApiResponse({ status: 401, description: '로그인 후 이용 가능합니다.'})
  @ApiResponse({ status: 400, description: '프로필에 변경된 정보가 없습니다.'})
  @ApiResponse({ status: 500, description: '파일업로드에 실패했습니다.'})
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
