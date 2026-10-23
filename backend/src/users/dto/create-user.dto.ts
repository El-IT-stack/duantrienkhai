import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsIn, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'canbo@pm.local' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password: string;

  @ApiPropertyOptional({ example: 'Lê Văn Cán Bộ' })
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  fullName?: string;

  @ApiPropertyOptional({ example: 'Lê Văn Cán Bộ' })
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  full_name?: string;

  @ApiProperty({ example: 'MEMBER', enum: ['ADMIN', 'PROJECT_MANAGER', 'MEMBER'] })
  @IsIn(['ADMIN', 'PROJECT_MANAGER', 'MEMBER'], { message: 'Vai trò phải là ADMIN, PROJECT_MANAGER hoặc MEMBER' })
  role: string;

  @ApiPropertyOptional({ example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CanBo' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CanBo' })
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
