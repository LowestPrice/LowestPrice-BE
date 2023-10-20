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

interface CustomRequest extends Request {
  user: {
    userId: number;
  };
}
@Controller('magazines')
export class MagazineController {
  constructor(private readonly magazineService: MagazineService) {}

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
  @Get()
  findAll() {
    return this.magazineService.findAll();
  }

  //! 라우팅 경로 문제로 코드 위로 올림
  //! 로그인 jwt 구현되면 /user/:userId 경로는 삭제(2023.10.10.화)
  //* 좋아요 조회
  @Get('/like')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  getLikes(@Req() req: CustomRequest) {
    const userId: number = req.user.userId;
    return this.magazineService.getLikes(userId);
  }

  //* 매거진 상세 조회
  @Get('/:magazineId')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  findOne(@Param('magazineId') magazineId: number) {
    return this.magazineService.findOne(magazineId);
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
  excludeOne(@Param('magazineId') magazineId: number) {
    return this.magazineService.excludeOne(magazineId);
  }

  //! 로그인 jwt 구현되면 /user/:userId 경로는 삭제(2023.10.10.화)
  //* 좋아요 설정
  @Post('/:magazineId/like')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(UnauthorizedExceptionFilter)
  setLike(
    @Req() req: CustomRequest,
    @Param('magazineId') magazineId: number,
  ) {
    const userId: number = req.user.userId;
    return this.magazineService.setLike(magazineId, userId);
  }
}
