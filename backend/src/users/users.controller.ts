import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users (Quản lý thành viên)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thành viên (có tìm kiếm & lọc)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm theo tên hoặc email' })
  @ApiQuery({ name: 'role', required: false, enum: ['ADMIN', 'PROJECT_MANAGER', 'MEMBER'] })
  async findAll(@Query('search') search?: string, @Query('role') role?: string) {
    return this.usersService.findAll(search, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một thành viên theo ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Thêm thành viên mới (Yêu cầu quyền ADMIN hoặc PROJECT_MANAGER)' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cập nhật thông tin thành viên (Yêu cầu quyền ADMIN)' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xóa thành viên khỏi hệ thống (Yêu cầu quyền ADMIN)' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
