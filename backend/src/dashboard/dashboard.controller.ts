import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard (Thống kê & Tổng quan)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy dữ liệu thống kê tổng hợp cho trang Dashboard' })
  @ApiResponse({ status: 200, description: 'Dữ liệu KPIs, tiến độ dự án và phân bố task' })
  async getDashboardData() {
    return this.dashboardService.getStats();
  }
}
