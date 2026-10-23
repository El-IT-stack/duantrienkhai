import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics (Prometheus)')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Endpoint xuất Prometheus metrics định dạng chuẩn' })
  @ApiResponse({ status: 200, description: 'Dữ liệu metrics cho Prometheus scraper' })
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', this.metricsService.getContentType());
    const metrics = await this.metricsService.getMetrics();
    return res.send(metrics);
  }
}
