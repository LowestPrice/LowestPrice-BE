import { HttpException, HttpStatus } from '@nestjs/common';

export class InternalServerErrorException extends HttpException {
  constructor() {
    super('서버 내부 에러가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class NotAuthorizedException extends HttpException {
  constructor() {
    super('로그인 후 이용 가능합니다.', HttpStatus.UNAUTHORIZED);
  }
}

//* Product Exception
export class NotFoundProductException extends HttpException {
  constructor() {
    super('해당 제품이 존재하지 않습니다.', HttpStatus.NOT_FOUND);
  }
}

export class NotFoundCategoryException extends HttpException {
  constructor() {
    super('해당 카테고리가 존재하지 않습니다.', HttpStatus.NOT_FOUND);
  }
}

export class NotFoundCategoryFilterException extends HttpException {
  constructor() {
    super('해당 필터가 존재하지 않습니다.', HttpStatus.NOT_FOUND);
  }
}
