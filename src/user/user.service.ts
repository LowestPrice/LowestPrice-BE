import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto.ts';
import { UserRepository } from './user.repository.js';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async signUp(createUserDto: CreateUserDto): Promise<object> {
    // 중복된 이메일이 있는지 확인
    const existUser = await this.userRepository.login(createUserDto.email);
    if (existUser) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    await this.userRepository.signUp(createUserDto);

    return {
      success: true,
      status: 201,
      message: '회원가입이 완료되었습니다.',
    };
  }

  async login(email: string): Promise<object> {
    const user = await this.userRepository.login(email);

    if (!user) {
      throw new NotFoundException('해당하는 유저가 없습니다.');
    }
    return user;
  }
}
