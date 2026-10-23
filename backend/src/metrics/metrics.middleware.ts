import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime();

    res.on('finish', () => {
      const diff = process.hrtime(start);
      const durationInSeconds = diff[0] + diff[1] / 1e9;

      // Chuẩn hóa route path (thay thế UUID bằng :id để tránh cardinality nổ tung trong Prometheus)
      const rawPath = req.baseUrl || req.path;
      const normalizedRoute = rawPath.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id');

      const labels = {
        method: req.method,
        route: normalizedRoute,
        status_code: res.statusCode.toString(),
      };

      this.metricsService.httpRequestCounter.inc(labels);
      this.metricsService.httpRequestDuration.observe(labels, durationInSeconds);
    });

    next();
  }
}
