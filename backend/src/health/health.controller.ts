import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { DatabaseService } from '../database/database.service';

@ApiTags('Health (Kiểm tra trạng thái hệ thống)')
@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint cho Docker Compose & K8s' })
  @ApiResponse({ status: 200, description: 'Hệ thống hoạt động bình thường' })
  @ApiResponse({ status: 503, description: 'Hệ thống hoặc Database gặp sự cố' })
  async check(@Res() res: Response) {
    const isDbHealthy = await this.db.isHealthy();
    const memory = process.memoryUsage();

    const healthData = {
      status: isDbHealthy ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        database: {
          status: isDbHealthy ? 'UP' : 'DOWN',
          engine: 'PostgreSQL 16',
        },
      },
      memory: {
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
      },
    };

    if (isDbHealthy) {
      return res.status(HttpStatus.OK).json(healthData);
    } else {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(healthData);
    }
  }
}
