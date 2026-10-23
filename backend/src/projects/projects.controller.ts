import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Projects (Quản lý dự án)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả dự án (kèm % tiến độ hoàn thành)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm theo tên hoặc mô tả' })
  @ApiQuery({ name: 'status', required: false, enum: ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  async findAll(@Query('search') search?: string, @Query('status') status?: string) {
    return this.projectsService.findAll(search, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết dự án (kèm danh sách thành viên và thống kê)' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Tạo dự án mới (Yêu cầu quyền ADMIN hoặc PROJECT_MANAGER)' })
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Cập nhật thông tin dự án' })
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Xóa dự án (Toàn bộ task sẽ tự động bị xóa theo CASCADE)' })
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Lấy danh sách thành viên thuộc dự án' })
  async getMembers(@Param('id') projectId: string) {
    return this.projectsService.getMembers(projectId);
  }

  @Post(':id/members')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Gán thành viên vào dự án' })
  async addMember(@Param('id') projectId: string, @Body() addMemberDto: AddMemberDto) {
    return this.projectsService.addMember(projectId, addMemberDto);
  }

  @Delete(':id/members/:userId')
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Xóa thành viên khỏi dự án' })
  async removeMember(@Param('id') projectId: string, @Param('userId') userId: string) {
    return this.projectsService.removeMember(projectId, userId);
  }
}
