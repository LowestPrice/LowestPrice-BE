import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    // HTTP 응답이 완료되면 로그를 남긴다.
    res.on('finish', () => {
      this.logger.log(
        `${req.ip}, ${req.method},${res.statusCode}`,
        req.originalUrl
      );
    });

    next();
  }
}
