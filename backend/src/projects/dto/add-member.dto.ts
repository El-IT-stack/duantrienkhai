import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { IsDbUUID } from '../../common/decorators/is-db-uuid.decorator';

export class AddMemberDto {
  @ApiPropertyOptional({ example: '44444444-4444-4444-4444-444444444444', description: 'ID thành viên cần thêm vào dự án' })
  @IsOptional()
  @IsDbUUID({ message: 'userId phải là UUID hợp lệ' })
  userId?: string;

  @ApiPropertyOptional({ example: '44444444-4444-4444-4444-444444444444', description: 'ID thành viên cần thêm vào dự án' })
  @IsOptional()
  @IsDbUUID({ message: 'user_id phải là UUID hợp lệ' })
  user_id?: string;

  @ApiPropertyOptional({ example: 'MEMBER', enum: ['MANAGER', 'LEAD', 'MEMBER', 'VIEWER'] })
  @IsOptional()
  @IsIn(['MANAGER', 'LEAD', 'MEMBER', 'VIEWER'], { message: 'Vai trò trong dự án không hợp lệ' })
  roleInProject?: string;

  @ApiPropertyOptional({ example: 'MEMBER', enum: ['MANAGER', 'LEAD', 'MEMBER', 'VIEWER'] })
  @IsOptional()
  @IsIn(['MANAGER', 'LEAD', 'MEMBER', 'VIEWER'], { message: 'Vai trò trong dự án không hợp lệ' })
  role_in_project?: string;
}
