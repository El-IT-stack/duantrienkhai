import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || 'project_management_db',
      user: process.env.POSTGRES_USER || 'postgres_admin',
      password: process.env.POSTGRES_PASSWORD || 'StrongP@ssw0rd_2026_Secure!',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle PostgreSQL client', err);
    });
  }

  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        const client = await this.pool.connect();
        this.logger.log('Successfully connected to PostgreSQL Database');
        client.release();
        await this.ensureSeedData();
        break;
      } catch (error) {
        retries--;
        this.logger.warn(`PostgreSQL connection failed. Retries left: ${retries}. Waiting 3s...`);
        if (retries === 0) {
          this.logger.error('Could not connect to PostgreSQL after multiple attempts.', error);
        } else {
          await new Promise((res) => setTimeout(res, 3000));
        }
      }
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('PostgreSQL connection pool closed');
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    const res = await this.pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`Executed query: ${text} | Duration: ${duration}ms | Rows: ${res.rowCount}`);
    }
    return res;
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async isHealthy(): Promise<boolean> {
    try {
      const res = await this.pool.query('SELECT 1 as healthy');
      return res.rows[0]?.healthy === 1;
    } catch {
      return false;
    }
  }

  private async ensureSeedData() {
    try {
      // Kiểm tra bảng users đã tồn tại chưa
      const tableCheck = await this.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'users'
        );
      `);

      if (!tableCheck.rows[0]?.exists) {
        this.logger.log('Users table does not exist yet. It will be initialized by init.sql or migrations.');
        return;
      }

      // Kiểm tra admin user đã tồn tại chưa
      const adminCheck = await this.query(`SELECT id FROM users WHERE email = 'admin@pm.local' LIMIT 1;`);
      if (adminCheck.rows.length === 0) {
        this.logger.log('Admin user not found. Seeding default demo accounts...');
        const passwordHash = await bcrypt.hash('Admin@123', 10);
        
        await this.query(`
          INSERT INTO users (id, email, password_hash, full_name, role, avatar_url, is_active)
          VALUES 
          ('11111111-1111-1111-1111-111111111111', 'admin@pm.local', $1, 'Nguyễn Quản Trị (Admin)', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', true),
          ('22222222-2222-2222-2222-222222222222', 'pm.minh@pm.local', $1, 'Trần Quang Minh (PM Lead)', 'PROJECT_MANAGER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minh', true),
          ('44444444-4444-4444-4444-444444444444', 'dev.tuan@pm.local', $1, 'Phạm Anh Tuấn (Backend Dev)', 'MEMBER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan', true)
          ON CONFLICT (email) DO NOTHING;
        `, [passwordHash]);
        this.logger.log('Default demo accounts seeded successfully.');
      }
    } catch (err) {
      this.logger.warn('Seed data check skipped: ' + err.message);
    }
  }
}
