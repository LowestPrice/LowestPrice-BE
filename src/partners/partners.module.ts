// src/partners/partners.module.ts

import { HttpModule } from '@nestjs/axios'; // 수정된 부분
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PartnersService } from './partners.service';

@Module({
  imports: [HttpModule, ConfigModule], // 수정된 부분
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
