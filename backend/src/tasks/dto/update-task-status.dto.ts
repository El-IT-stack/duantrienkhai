import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsIn, IsInt, Min } from 'class-validator';

export class UpdateTaskStatusDto {
  @ApiProperty({ example: 'DONE', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] })
  @IsNotEmpty({ message: 'status không được để trống' })
  @IsIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], { message: 'Trạng thái công việc không hợp lệ' })
  status: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
