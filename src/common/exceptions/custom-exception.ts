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

//* Search Exception
export class NotFoundSearchFilterException extends HttpException {
  constructor() {
    super('해당 검색 필터가 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
  }
}

export class NotFoundMagzineException extends HttpException {
  constructor() {
    super('해당 매거진이 존재하지 않습니다.', HttpStatus.NOT_FOUND);
  }
}

export class AdminAccessDeniedException extends HttpException {
  constructor() {
    super('관리자만 접근 가능합니다.', HttpStatus.UNAUTHORIZED);
  }
}

export class FileUploadException extends HttpException {
  constructor() {
    super('파일 업로드에 실패했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class NoUpdateProfileException extends HttpException {
  constructor() {
    super('프로필에 변경된 정보가 없습니다.', HttpStatus.BAD_REQUEST);
  }
}

// 알림 내역 조회
export class NotFoundNotificationException extends HttpException {
  constructor() {
    super('해당 알림 내역이 존재하지 않습니다.', HttpStatus.NOT_FOUND);
  }
}
