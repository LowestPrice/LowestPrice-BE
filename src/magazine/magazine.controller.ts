// src/magazine/magazine.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Put,
  UseGuards,
  Req,
  UseFilters,
} from '@nestjs/common';
import { MagazineService } from './magazine.service';
import { CreateMagazineDto } from './dto/create.magazine.dto';
import { UpdateMagazineDto } from './dto/update.magazine.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedExceptionFilter } from 'src/auth/util/decorator/not-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/option-jwt-auth.guard';

interface CustomRequest extends Request {
  user: {
    userId: number;
  };
}
@Controller('magazines')
export class MagazineController {
  constructor(private readonly magazineService: MagazineService) {}
  //! 2023.10.23. 매거진 조회 - 모든 사용자 볼 수 있게 공개

  //* 매거진 등록
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Req() req: CustomRequest,
    @UploadedFile() // new ParseFilePipeBuilder().build({
    // })
    file //   fileIsRequired: true,
    : Express.Multer.File,
    @Body() createMagazineDto: CreateMagazineDto
  ) {
    const userId: number = req.user.userId;
    return this.magazineService.create(userId, file, createMagazineDto);
  }

  //* 매거진 조회
  //? 옳지 않는 토큰값을 가지고 왔을 때 처리 필요
  @Get()
  @UseGuards(OptionalJwtAuthGuard) //! jwt 있으면 userId 파싱 후 통과, jwt 없으면 그냥 통과
  findAll(@Req() req: CustomRequest) {
    let userId = null;
    // 인증된 사용자인 경우 userId를 설정
    if (req.user) {
      userId = req.user.userId;
    }
    console.log(`전체 조회 접근 사용자 : ${userId}`);
    return this.magazineService.findAll(userId);
  }

  //! 라우팅 경로 문제로 코드 위로 올림
  //* 좋아요 조회
  @Get('/like')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  getLikes(@Req() req: CustomRequest) {
    const userId: number = req.user.userId;
    return this.magazineService.getLikes(userId);
  }

  //* 매거진 파일 업로드
  @Post('file')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  @UseInterceptors(FileInterceptor('file'))
  fileUpload(
    @Req() req: CustomRequest,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    const userId: number = req.user.userId;
    return this.magazineService.UploadMagazineFile(userId, file);
  }

  //* 매거진 상세 조회
  @Get('/:magazineId')
  @UseGuards(OptionalJwtAuthGuard) //! jwt 있으면 userId 파싱 후 통과, jwt 없으면 그냥 통과
  findOne(@Req() req: CustomRequest, @Param('magazineId') magazineId: number) {
    let userId = null;
    // 인증된 사용자인 경우 userId를 설정
    if (req.user) {
      userId = req.user.userId;
    }
    return this.magazineService.findOne(magazineId, userId);
  }

  //* 매거진 수정
  @Put('/:magazineId')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  @UseInterceptors(FileInterceptor('file'))
  update(
    @UploadedFile()
    file: Express.Multer.File,
    @Req() req: CustomRequest,
    @Param('magazineId') magazineId: number,
    @Body() updateMagazineDto: UpdateMagazineDto
  ) {
    const userId: number = req.user.userId;
    return this.magazineService.update(
      userId,
      magazineId,
      file,
      updateMagazineDto
    );
  }

  //* 매거진 삭제
  @Delete('/:magazineId')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  remove(@Req() req: CustomRequest, @Param('magazineId') magazineId: number) {
    const userId: number = req.user.userId;
    return this.magazineService.remove(userId, magazineId);
  }

  //* 현재 매거진 제외한 나머지 매거진 리스트
  @Get('/:magazineId/list')
  @UseGuards(OptionalJwtAuthGuard) //! jwt 있으면 userId 파싱 후 통과, jwt 없으면 그냥 통과
  excludeOne(
    @Req() req: CustomRequest,
    @Param('magazineId') magazineId: number
  ) {
    let userId = null;
    // 인증된 사용자인 경우 userId를 설정
    if (req.user) {
      userId = req.user.userId;
    }
    return this.magazineService.exceptOne(magazineId, userId);
  }

  //! 로그인 jwt 구현되면 /user/:userId 경로는 삭제(2023.10.10.화)
  //* 좋아요 설정
  @Post('/:magazineId/like')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  setLike(@Req() req: CustomRequest, @Param('magazineId') magazineId: number) {
    const userId: number = req.user.userId;
    return this.magazineService.setLike(userId, magazineId);
  }
}
