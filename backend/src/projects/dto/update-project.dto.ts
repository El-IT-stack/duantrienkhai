import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';
import { IsDbUUID } from '../../common/decorators/is-db-uuid.decorator';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Hệ thống Quản lý Khách sạn Cloud v2' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Cập nhật mô tả mới cho dự án' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'IN_PROGRESS', enum: ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
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

  @ApiPropertyOptional({ example: '2026-08-30' })
  @IsOptional()
  @IsDateString({}, { message: 'endDate phải đúng định dạng YYYY-MM-DD' })
  endDate?: string;

  @ApiPropertyOptional({ example: '2026-08-30' })
  @IsOptional()
  @IsDateString({}, { message: 'end_date phải đúng định dạng YYYY-MM-DD' })
  end_date?: string;
}
