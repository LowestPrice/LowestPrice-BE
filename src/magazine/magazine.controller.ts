import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MagazineService } from './magazine.service';
import { CreateMagazineDto } from './dto/create.magazine.dto';
import { UpdateMagazineDto } from './dto/update.magazine.dto';

@Controller('magazines')
export class MagazineController {
  constructor(private readonly magazineService: MagazineService) {}

  //* 매거진 등록
  // 로그인 사용자 필요
  @Post()
  create(@Body() createMagazineDto: CreateMagazineDto) {
    return this.magazineService.create(createMagazineDto);
  }

  //* 매거진 조회
  @Get()
  findAll() {
    return this.magazineService.findAll();
  }

  //* 매거진 상세 조회
  @Get('/:magazineId')
  findOne(@Param('magazineId') magazineId: number) {
    return this.magazineService.findOne(magazineId);
  }

  //* 매거진 수정
  @Patch('/:magazineId')
  update(
    @Param('magazineId') magazineId: number,
    @Body() updateMagazineDto: UpdateMagazineDto
  ) {
    return this.magazineService.update(magazineId, updateMagazineDto);
  }

  //* 매거진 삭제
  @Delete('/:magazineId')
  remove(@Param('magazineId') magazineId: number) {
    return this.magazineService.remove(magazineId);
  }
}
