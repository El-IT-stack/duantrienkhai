import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'newuser@pm.local', description: 'Email đăng ký' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ example: 'Password@123', description: 'Mật khẩu' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn Mới', description: 'Họ và tên đầy đủ' })
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  fullName?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn Mới', description: 'Họ và tên đầy đủ' })
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  full_name?: string;

  @ApiPropertyOptional({ example: 'MEMBER', enum: ['ADMIN', 'PROJECT_MANAGER', 'MEMBER'] })
  @IsOptional()
  @IsIn(['ADMIN', 'PROJECT_MANAGER', 'MEMBER'], { message: 'Vai trò không hợp lệ' })
  role?: string;

  @ApiPropertyOptional({ example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=New' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=New' })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}
