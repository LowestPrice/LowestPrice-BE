import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.user.dto.ts';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<object> {
    return this.userService.signUp(createUserDto);
  }

  @Get('login')
  async login(@Body('email') email: string): Promise<object> {
    return this.userService.login(email);
  }
}
