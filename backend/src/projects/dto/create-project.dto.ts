import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn, IsDateString } from 'class-validator';
import { IsDbUUID } from '../../common/decorators/is-db-uuid.decorator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Hệ thống Quản lý Khách sạn Cloud' })
  @IsString({ message: 'Tên dự án phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên dự án không được để trống' })
  name: string;

  @ApiPropertyOptional({ example: 'Dự án số hóa quản lý phòng và đặt phòng trực tuyến' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'PLANNING', enum: ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsOptional()
  @IsIn(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], { message: 'Trạng thái dự án không hợp lệ' })
  status?: string;

  @ApiPropertyOptional({ example: '22222222-2222-2222-2222-222222222222' })
  @IsOptional()
  @IsDbUUID({ message: 'managerId phải là UUID hợp lệ' })
  managerId?: string;

  @ApiPropertyOptional({ example: '22222222-2222-2222-2222-222222222222' })
  @IsOptional()
  @IsDbUUID({ message: 'manager_id phải là UUID hợp lệ' })
  manager_id?: string;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsDateString({}, { message: 'startDate phải đúng định dạng YYYY-MM-DD' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsDateString({}, { message: 'start_date phải đúng định dạng YYYY-MM-DD' })
  start_date?: string;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsDateString({}, { message: 'endDate phải đúng định dạng YYYY-MM-DD' })
  endDate?: string;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsDateString({}, { message: 'end_date phải đúng định dạng YYYY-MM-DD' })
  end_date?: string;
}
