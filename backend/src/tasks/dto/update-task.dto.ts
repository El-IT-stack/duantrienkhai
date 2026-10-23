import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsDateString, IsInt, Min } from 'class-validator';
import { IsDbUUID } from '../../common/decorators/is-db-uuid.decorator';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Thiết kế REST API xác thực JWT (Cập nhật)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Bổ sung thêm Refresh Token và Rate Limiter' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'IN_PROGRESS', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] })
  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], { message: 'Trạng thái công việc không hợp lệ' })
  status?: string;

  @ApiPropertyOptional({ example: 'URGENT', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], { message: 'Mức độ ưu tiên không hợp lệ' })
  priority?: string;

  @ApiPropertyOptional({ example: '44444444-4444-4444-4444-444444444444' })
  @IsOptional()
  @IsDbUUID({ message: 'assigneeId phải là UUID hợp lệ' })
  assigneeId?: string;

  @ApiPropertyOptional({ example: '44444444-4444-4444-4444-444444444444' })
  @IsOptional()
  @IsDbUUID({ message: 'assignee_id phải là UUID hợp lệ' })
  assignee_id?: string;

  @ApiPropertyOptional({ example: '2026-04-20' })
  @IsOptional()
  @IsDateString({}, { message: 'dueDate phải đúng định dạng YYYY-MM-DD' })
  dueDate?: string;

  @ApiPropertyOptional({ example: '2026-04-20' })
  @IsOptional()
  @IsDateString({}, { message: 'due_date phải đúng định dạng YYYY-MM-DD' })
  due_date?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
