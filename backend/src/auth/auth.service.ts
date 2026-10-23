import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const res = await this.db.query(
      'SELECT id, email, password_hash, full_name, role, avatar_url, is_active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const user = res.rows[0];
    if (!user) {
      return null;
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Tài khoản đã bị tạm khóa');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      return null;
    }

    const { password_hash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase().trim();
    const existing = await this.db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const role = registerDto.role || 'MEMBER';
    const avatarUrl = registerDto.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(registerDto.fullName)}`;

    const res = await this.db.query(
      `INSERT INTO users (email, password_hash, full_name, role, avatar_url, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, email, full_name, role, avatar_url, is_active, created_at`,
      [email, passwordHash, registerDto.fullName, role, avatarUrl]
    );

    const newUser = res.rows[0];
    const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Đăng ký tài khoản thành công',
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        avatarUrl: newUser.avatar_url,
      },
    };
  }

  async getProfile(userId: string) {
    const res = await this.db.query(
      `SELECT id, email, full_name, role, avatar_url, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundException('Không tìm thấy thông tin tài khoản');
    }

    return res.rows[0];
  }
}
