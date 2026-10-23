import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class TasksService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(queryFilters: {
    projectId?: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
    search?: string;
    isOverdue?: boolean;
  }) {
    let query = `
      SELECT 
        t.id, 
        t.project_id, 
        t.title, 
        t.description, 
        t.status, 
        t.priority, 
        t.assignee_id, 
        t.creator_id, 
        t.due_date, 
        t.position, 
        t.created_at, 
        t.updated_at,
        p.name as project_name,
        u_assignee.full_name as assignee_name,
        u_assignee.email as assignee_email,
        u_assignee.avatar_url as assignee_avatar,
        u_creator.full_name as creator_name,
        CASE 
          WHEN t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status != 'DONE' 
          THEN true 
          ELSE false 
        END as is_overdue,
        COUNT(tc.id)::int as comments_count
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
      LEFT JOIN users u_creator ON t.creator_id = u_creator.id
      LEFT JOIN task_comments tc ON t.id = tc.task_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (queryFilters.projectId) {
      params.push(queryFilters.projectId);
      query += ` AND t.project_id = $${params.length}`;
    }

    if (queryFilters.assigneeId) {
      params.push(queryFilters.assigneeId);
      query += ` AND t.assignee_id = $${params.length}`;
    }

    if (queryFilters.status) {
      params.push(queryFilters.status);
      query += ` AND t.status = $${params.length}`;
    }

    if (queryFilters.priority) {
      params.push(queryFilters.priority);
      query += ` AND t.priority = $${params.length}`;
    }

    if (queryFilters.search) {
      params.push(`%${queryFilters.search.toLowerCase()}%`);
      query += ` AND (LOWER(t.title) LIKE $${params.length} OR LOWER(t.description) LIKE $${params.length})`;
    }

    if (queryFilters.isOverdue) {
      query += ` AND (t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status != 'DONE')`;
    }

    query += `
      GROUP BY t.id, p.id, u_assignee.id, u_creator.id
      ORDER BY t.position ASC, t.created_at DESC
    `;

    const res = await this.db.query(query, params);
    return res.rows;
  }

  async findOne(id: string) {
    const taskRes = await this.db.query(
      `SELECT 
        t.id, 
        t.project_id, 
        t.title, 
        t.description, 
        t.status, 
        t.priority, 
        t.assignee_id, 
        t.creator_id, 
        t.due_date, 
        t.position, 
        t.created_at, 
        t.updated_at,
        p.name as project_name,
        u_assignee.full_name as assignee_name,
        u_assignee.email as assignee_email,
        u_assignee.avatar_url as assignee_avatar,
        u_creator.full_name as creator_name,
        CASE 
          WHEN t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status != 'DONE' 
          THEN true 
          ELSE false 
        END as is_overdue
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
      LEFT JOIN users u_creator ON t.creator_id = u_creator.id
      WHERE t.id = $1`,
      [id]
    );

    if (taskRes.rows.length === 0) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }

    const task = taskRes.rows[0];

    // Lấy danh sách bình luận
    const commentsRes = await this.db.query(
      `SELECT 
        tc.id,
        tc.task_id,
        tc.user_id,
        tc.content,
        tc.created_at,
        u.full_name as user_name,
        u.email as user_email,
        u.avatar_url as user_avatar,
        u.role as user_role
       FROM task_comments tc
       JOIN users u ON tc.user_id = u.id
       WHERE tc.task_id = $1
       ORDER BY tc.created_at ASC`,
      [id]
    );

    task.comments = commentsRes.rows;
    return task;
  }

  async create(dto: CreateTaskDto, creatorId?: string) {
    const projectId = dto.projectId || dto.project_id;
    if (!projectId) {
      throw new BadRequestException('projectId hoặc project_id không được để trống');
    }

    // Kiểm tra dự án có tồn tại không
    const projectCheck = await this.db.query('SELECT id FROM projects WHERE id = $1', [projectId]);
    if (projectCheck.rows.length === 0) {
      throw new NotFoundException(`Không tìm thấy dự án với ID: ${projectId}`);
    }

    const status = dto.status || 'TODO';
    const priority = dto.priority || 'MEDIUM';
    const position = dto.position !== undefined ? dto.position : 0;
    const assigneeId = dto.assigneeId || dto.assignee_id || null;
    const dueDate = dto.dueDate || dto.due_date || null;

    const res = await this.db.query(
      `INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, creator_id, due_date, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        projectId,
        dto.title,
        dto.description || null,
        status,
        priority,
        assigneeId,
        creatorId || null,
        dueDate,
        position,
      ]
    );

    return this.findOne(res.rows[0].id);
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id);

    const updates: string[] = [];
    const params: any[] = [];

    if (dto.title !== undefined) {
      params.push(dto.title);
      updates.push(`title = $${params.length}`);
    }

    if (dto.description !== undefined) {
      params.push(dto.description);
      updates.push(`description = $${params.length}`);
    }

    if (dto.status !== undefined) {
      params.push(dto.status);
      updates.push(`status = $${params.length}`);
    }

    if (dto.priority !== undefined) {
      params.push(dto.priority);
      updates.push(`priority = $${params.length}`);
    }

    const assigneeId = dto.assigneeId !== undefined ? dto.assigneeId : dto.assignee_id;
    if (assigneeId !== undefined) {
      params.push(assigneeId || null);
      updates.push(`assignee_id = $${params.length}`);
    }

    const dueDate = dto.dueDate !== undefined ? dto.dueDate : dto.due_date;
    if (dueDate !== undefined) {
      params.push(dueDate || null);
      updates.push(`due_date = $${params.length}`);
    }

    if (dto.position !== undefined) {
      params.push(dto.position);
      updates.push(`position = $${params.length}`);
    }

    if (updates.length > 0) {
      params.push(id);
      await this.db.query(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${params.length}`,
        params
      );
    }

    return this.findOne(id);
  }

  async updateStatus(id: string, dto: UpdateTaskStatusDto) {
    await this.findOne(id);

    if (dto.position !== undefined) {
      await this.db.query(
        'UPDATE tasks SET status = $1, position = $2 WHERE id = $3',
        [dto.status, dto.position, id]
      );
    } else {
      await this.db.query(
        'UPDATE tasks SET status = $1 WHERE id = $2',
        [dto.status, id]
      );
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.query('DELETE FROM tasks WHERE id = $1', [id]);
    return { success: true, message: 'Đã xóa công việc thành công' };
  }

  async addComment(taskId: string, userId: string, dto: CreateCommentDto) {
    await this.findOne(taskId);

    const res = await this.db.query(
      `INSERT INTO task_comments (task_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, task_id, user_id, content, created_at`,
      [taskId, userId, dto.content]
    );

    const comment = res.rows[0];
    const user = await this.db.query(
      'SELECT full_name, email, avatar_url, role FROM users WHERE id = $1',
      [userId]
    );

    return {
      ...comment,
      user_name: user.rows[0]?.full_name,
      user_email: user.rows[0]?.email,
      user_avatar: user.rows[0]?.avatar_url,
      user_role: user.rows[0]?.role,
    };
  }

  async deleteComment(commentId: string, userId: string, userRole: string) {
    const res = await this.db.query('SELECT user_id FROM task_comments WHERE id = $1', [commentId]);
    if (res.rows.length === 0) {
      throw new NotFoundException('Không tìm thấy bình luận');
    }

    // Chỉ người viết bình luận hoặc ADMIN/PM mới được xóa
    if (res.rows[0].user_id !== userId && userRole !== 'ADMIN' && userRole !== 'PROJECT_MANAGER') {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }

    await this.db.query('DELETE FROM task_comments WHERE id = $1', [commentId]);
    return { success: true, message: 'Đã xóa bình luận' };
  }
}
