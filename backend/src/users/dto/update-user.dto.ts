import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsIn, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'canbo@pm.local' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiPropertyOptional({ example: 'NewSecret@123' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password?: string;

  @ApiPropertyOptional({ example: 'Lê Văn Cán Bộ Sửa' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Lê Văn Cán Bộ Sửa' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: 'MEMBER', enum: ['ADMIN', 'PROJECT_MANAGER', 'MEMBER'] })
  @IsOptional()
  @IsIn(['ADMIN', 'PROJECT_MANAGER', 'MEMBER'], { message: 'Vai trò phải là ADMIN, PROJECT_MANAGER hoặc MEMBER' })
  role?: string;

  @ApiPropertyOptional({ example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CanBo2' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CanBo2' })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
