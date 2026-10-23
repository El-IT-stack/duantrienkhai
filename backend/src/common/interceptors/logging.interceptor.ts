import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = res.statusCode;
          const contentLength = res.get('content-length') || 0;
          const responseTime = Date.now() - now;
          const jsonLog = JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            method,
            url: originalUrl,
            status: statusCode,
            responseTime,
            ip,
            userAgent,
            contentLength,
          }) + '\n';
          this.logger.log(
            `[${method}] ${originalUrl} ${statusCode} - ${responseTime}ms - ${ip} "${userAgent}" ${contentLength}b`
          );
          this.writeToFile(jsonLog);
        },
        error: (err) => {
          const responseTime = Date.now() - now;
          const statusCode = err.status || 500;
          const jsonLog = JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'error',
            method,
            url: originalUrl,
            status: statusCode,
            responseTime,
            ip,
            userAgent,
            message: err.message,
          }) + '\n';
          this.logger.warn(
            `[${method}] ${originalUrl} ${statusCode} - ${responseTime}ms - ${ip} - Error: ${err.message}`
          );
          this.writeToFile(jsonLog);
        },
      }),
    );
  }

  private writeToFile(line: string) {
    try {
      const fs = require('fs');
      const logDir = '/var/log/backend';
      if (fs.existsSync(logDir)) {
        fs.appendFileSync(`${logDir}/app.log`, line);
      }
    } catch {
      // ignore file write errors
    }
  }
}
