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
} from '@nestjs/common';
import { MagazineService } from './magazine.service';
import { CreateMagazineDto } from './dto/create.magazine.dto';
import { UpdateMagazineDto } from './dto/update.magazine.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('magazines')
export class MagazineController {
  constructor(private readonly magazineService: MagazineService) {}

  //* 매거진 등록
  // 로그인 사용자 필요
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile() // new ParseFilePipeBuilder().build({
    // })
    file //   fileIsRequired: true,
    : Express.Multer.File,
    @Body() createMagazineDto: CreateMagazineDto
  ) {
    console.log(file);
    return this.magazineService.create(file, createMagazineDto);
  }

  //* 매거진 조회
  @Get()
  findAll() {
    return this.magazineService.findAll();
  }

  //! 라우팅 경로 문제로 코드 위로 올림
  //! 로그인 jwt 구현되면 /user/:userId 경로는 삭제(2023.10.10.화)
  //* 좋아요 조회
  @Get('/user/:userId/like')
  getLikes(@Param('userId') userId: number) {
    return this.magazineService.getLikes(userId);
  }

  //* 매거진 상세 조회
  @Get('/:magazineId')
  findOne(@Param('magazineId') magazineId: number) {
    return this.magazineService.findOne(magazineId);
  }

  //* 매거진 수정
  @Put('/:magazineId')
  update(
    @UploadedFile()
    file: Express.Multer.File,
    @Param('magazineId') magazineId: number,
    @Body() updateMagazineDto: UpdateMagazineDto
  ) {
    return this.magazineService.update(magazineId, file, updateMagazineDto);
  }

  //* 매거진 삭제
  @Delete('/:magazineId')
  remove(@Param('magazineId') magazineId: number) {
    return this.magazineService.remove(magazineId);
  }

  //* 현재 매거진 제외한 나머지 매거진 리스트
  @Get('/:magazineId/list')
  excludeOne(@Param('magazineId') magazineId: number) {
    return this.magazineService.excludeOne(magazineId);
  }

  //! 로그인 jwt 구현되면 /user/:userId 경로는 삭제(2023.10.10.화)
  //* 좋아요 설정
  @Post('/:magazineId/user/:userId/like')
  setLike(
    @Param('magazineId') magazineId: number,
    @Param('userId') userId: number //* param 여러개 값 가져올 때, 똑같이 추가해주면 됨
  ) {
    return this.magazineService.setLike(magazineId, userId);
  }
}
