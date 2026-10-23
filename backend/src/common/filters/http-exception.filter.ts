import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Đã có lỗi nội bộ xảy ra, vui lòng thử lại sau';
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionRes = exception.getResponse();
      if (typeof exceptionRes === 'object' && exceptionRes !== null) {
        message = (exceptionRes as any).message || exception.message;
        errorName = (exceptionRes as any).error || exception.name;
      } else {
        message = exceptionRes;
        errorName = exception.name;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`[Unhandled Error] ${exception.message}`, exception.stack);
      // Giữ kín chi tiết lỗi cơ sở dữ liệu hoặc stack trace (Hardening)
      message = 'Thao tác không thành công do lỗi hệ thống';
    }

    response.status(status).json({
      statusCode: status,
      error: errorName,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
