import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Tasks (Quản lý công việc)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách công việc (hỗ trợ lọc dự án, thành viên, trạng thái, quá hạn)' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'assigneeId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isOverdue', required: false, type: Boolean })
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Query('isOverdue') isOverdue?: string,
  ) {
    return this.tasksService.findAll({
      projectId,
      assigneeId,
      status,
      priority,
      search,
      isOverdue: isOverdue === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết công việc và danh sách bình luận' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo công việc mới trong dự án' })
  async create(@Body() createTaskDto: CreateTaskDto, @CurrentUser('id') userId: string) {
    return this.tasksService.create(createTaskDto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin công việc' })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái Kanban & vị trí công việc' })
  async updateStatus(@Param('id') id: string, @Body() updateTaskStatusDto: UpdateTaskStatusDto) {
    return this.tasksService.updateStatus(id, updateTaskStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa công việc' })
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Gửi bình luận vào công việc' })
  async addComment(
    @Param('id') taskId: string,
    @CurrentUser('id') userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.tasksService.addComment(taskId, userId, createCommentDto);
  }

  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Xóa bình luận' })
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.tasksService.deleteComment(commentId, userId, userRole);
  }
}
