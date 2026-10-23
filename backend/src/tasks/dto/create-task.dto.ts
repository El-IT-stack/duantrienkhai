import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn, IsDateString, IsInt, Min } from 'class-validator';
import { IsDbUUID } from '../../common/decorators/is-db-uuid.decorator';

export class CreateTaskDto {
  @ApiPropertyOptional({ example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', description: 'ID dự án chứa task này' })
  @IsOptional()
  @IsDbUUID({ message: 'projectId phải là UUID hợp lệ' })
  projectId?: string;

  @ApiPropertyOptional({ example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', description: 'ID dự án chứa task này' })
  @IsOptional()
  @IsDbUUID({ message: 'project_id phải là UUID hợp lệ' })
  project_id?: string;

  @ApiProperty({ example: 'Thiết kế REST API xác thực JWT' })
  @IsString({ message: 'Tiêu đề công việc phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tiêu đề công việc không được để trống' })
  title: string;

  @ApiPropertyOptional({ example: 'Định nghĩa chi tiết các DTO và Guards phân quyền' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'TODO', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] })
  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], { message: 'Trạng thái công việc không hợp lệ' })
  status?: string;

  @ApiPropertyOptional({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
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

  @ApiPropertyOptional({ example: '2026-04-15' })
  @IsOptional()
  @IsDateString({}, { message: 'dueDate phải đúng định dạng YYYY-MM-DD' })
  dueDate?: string;

  @ApiPropertyOptional({ example: '2026-04-15' })
  @IsOptional()
  @IsDateString({}, { message: 'due_date phải đúng định dạng YYYY-MM-DD' })
  due_date?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
