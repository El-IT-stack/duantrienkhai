import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(search?: string, role?: string) {
    let query = `
      SELECT id, email, full_name, role, avatar_url, is_active, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      query += ` AND (LOWER(full_name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
    }

    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const res = await this.db.query(query, params);
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.db.query(
      `SELECT id, email, full_name, role, avatar_url, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new NotFoundException(`Không tìm thấy thành viên với ID: ${id}`);
    }

    return res.rows[0];
  }

  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const fullName = dto.fullName || dto.full_name;
    if (!fullName) {
      throw new BadRequestException('fullName hoặc full_name không được để trống');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const avatarUrl = dto.avatarUrl || dto.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;
    const isActive = dto.isActive !== undefined ? dto.isActive : (dto.is_active !== undefined ? dto.is_active : true);

    const res = await this.db.query(
      `INSERT INTO users (email, password_hash, full_name, role, avatar_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, role, avatar_url, is_active, created_at`,
      [email, passwordHash, fullName, dto.role, avatarUrl, isActive]
    );

    return res.rows[0];
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    const updates: string[] = [];
    const params: any[] = [];

    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const email = dto.email.toLowerCase().trim();
      const existing = await this.db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (existing.rows.length > 0) {
        throw new ConflictException('Email đã tồn tại ở tài khoản khác');
      }
      params.push(email);
      updates.push(`email = $${params.length}`);
    }

    if (dto.password) {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      params.push(passwordHash);
      updates.push(`password_hash = $${params.length}`);
    }

    const fullName = dto.fullName !== undefined ? dto.fullName : dto.full_name;
    if (fullName !== undefined) {
      params.push(fullName);
      updates.push(`full_name = $${params.length}`);
    }

    if (dto.role !== undefined) {
      params.push(dto.role);
      updates.push(`role = $${params.length}`);
    }

    const avatarUrl = dto.avatarUrl !== undefined ? dto.avatarUrl : dto.avatar_url;
    if (avatarUrl !== undefined) {
      params.push(avatarUrl);
      updates.push(`avatar_url = $${params.length}`);
    }

    const isActive = dto.isActive !== undefined ? dto.isActive : dto.is_active;
    if (isActive !== undefined) {
      params.push(isActive);
      updates.push(`is_active = $${params.length}`);
    }

    if (updates.length === 0) {
      return user;
    }

    params.push(id);
    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
      RETURNING id, email, full_name, role, avatar_url, is_active, created_at, updated_at
    `;

    const res = await this.db.query(query, params);
    return res.rows[0];
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return { success: true, message: 'Đã xóa thành viên thành công' };
  }
}
