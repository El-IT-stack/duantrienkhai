import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: client.Registry;
  public readonly httpRequestCounter: client.Counter<string>;
  public readonly httpRequestDuration: client.Histogram<string>;
  public readonly dbStatusGauge: client.Gauge<string>;

  constructor(private readonly db: DatabaseService) {
    this.registry = new client.Registry();

    // Default system & Node.js metrics
    client.collectDefaultMetrics({ register: this.registry });

    // Custom HTTP request counter
    this.httpRequestCounter = new client.Counter({
      name: 'http_requests_total',
      help: 'Tổng số lượt HTTP request đến backend API',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    // Custom HTTP duration histogram
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Thời gian xử lý HTTP request tính bằng giây',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    // Custom DB connection status gauge
    this.dbStatusGauge = new client.Gauge({
      name: 'pm_database_connected',
      help: 'Trạng thái kết nối cơ sở dữ liệu PostgreSQL (1: Connected, 0: Disconnected)',
      registers: [this.registry],
    });
  }

  onModuleInit() {
    this.updateDbStatus();
    setInterval(() => this.updateDbStatus(), 15000);
  }

  private async updateDbStatus() {
    const isUp = await this.db.isHealthy();
    this.dbStatusGauge.set(isUp ? 1 : 0);
  }

  async getMetrics(): Promise<string> {
    await this.updateDbStatus();
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
