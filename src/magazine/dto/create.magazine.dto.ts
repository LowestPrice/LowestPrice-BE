import { PickType } from '@nestjs/swagger';
import { Magazine } from '../entities/magazine.entity';
export class CreateMagazineDto extends PickType(Magazine, [
  'title',
  'content',
  'mainImage',
]) {}
