import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(search?: string, status?: string) {
    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.status, 
        p.manager_id,
        p.start_date, 
        p.end_date, 
        p.created_at, 
        p.updated_at,
        u.full_name as manager_name,
        u.email as manager_email,
        u.avatar_url as manager_avatar,
        COUNT(t.id)::int as total_tasks,
        COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::int as completed_tasks,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0 
          ELSE ROUND((COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::numeric / COUNT(t.id)::numeric) * 100) 
        END::int as progress_percent
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      query += ` AND (LOWER(p.name) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }

    query += `
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
    `;

    const res = await this.db.query(query, params);
    return res.rows;
  }

  async findOne(id: string) {
    const projectRes = await this.db.query(
      `SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.status, 
        p.manager_id,
        p.start_date, 
        p.end_date, 
        p.created_at, 
        p.updated_at,
        u.full_name as manager_name,
        u.email as manager_email,
        u.avatar_url as manager_avatar,
        COUNT(t.id)::int as total_tasks,
        COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::int as completed_tasks,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0 
          ELSE ROUND((COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::numeric / COUNT(t.id)::numeric) * 100) 
        END::int as progress_percent
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = $1
      GROUP BY p.id, u.id`,
      [id]
    );

    if (projectRes.rows.length === 0) {
      throw new NotFoundException(`Không tìm thấy dự án với ID: ${id}`);
    }

    const project = projectRes.rows[0];

    // Lấy danh sách thành viên trong dự án
    const membersRes = await this.db.query(
      `SELECT 
        pm.user_id,
        pm.role_in_project,
        pm.joined_at,
        u.full_name,
        u.email,
        u.role as system_role,
        u.avatar_url
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at ASC`,
      [id]
    );

    project.members = membersRes.rows;

    return project;
  }

  async create(dto: CreateProjectDto) {
    const status = dto.status || 'PLANNING';
    const managerId = dto.managerId || dto.manager_id || null;
    const startDate = dto.startDate || dto.start_date || null;
    const endDate = dto.endDate || dto.end_date || null;

    const res = await this.db.query(
      `INSERT INTO projects (name, description, status, manager_id, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, status, manager_id, start_date, end_date, created_at, updated_at`,
      [dto.name, dto.description || null, status, managerId, startDate, endDate]
    );

    const project = res.rows[0];

    // Nếu có managerId, tự động thêm manager vào bảng project_members
    if (managerId) {
      await this.db.query(
        `INSERT INTO project_members (project_id, user_id, role_in_project)
         VALUES ($1, $2, 'MANAGER')
         ON CONFLICT (project_id, user_id) DO NOTHING`,
        [project.id, managerId]
      );
    }

    return this.findOne(project.id);
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);

    const updates: string[] = [];
    const params: any[] = [];

    if (dto.name !== undefined) {
      params.push(dto.name);
      updates.push(`name = $${params.length}`);
    }

    if (dto.description !== undefined) {
      params.push(dto.description);
      updates.push(`description = $${params.length}`);
    }

    if (dto.status !== undefined) {
      params.push(dto.status);
      updates.push(`status = $${params.length}`);
    }

    const managerId = dto.managerId !== undefined ? dto.managerId : dto.manager_id;
    if (managerId !== undefined) {
      params.push(managerId || null);
      updates.push(`manager_id = $${params.length}`);

      if (managerId) {
        await this.db.query(
          `INSERT INTO project_members (project_id, user_id, role_in_project)
           VALUES ($1, $2, 'MANAGER')
           ON CONFLICT (project_id, user_id) DO NOTHING`,
          [id, managerId]
        );
      }
    }

    const startDate = dto.startDate !== undefined ? dto.startDate : dto.start_date;
    if (startDate !== undefined) {
      params.push(startDate || null);
      updates.push(`start_date = $${params.length}`);
    }

    const endDate = dto.endDate !== undefined ? dto.endDate : dto.end_date;
    if (endDate !== undefined) {
      params.push(endDate || null);
      updates.push(`end_date = $${params.length}`);
    }

    if (updates.length > 0) {
      params.push(id);
      await this.db.query(
        `UPDATE projects SET ${updates.join(', ')} WHERE id = $${params.length}`,
        params
      );
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.query('DELETE FROM projects WHERE id = $1', [id]);
    return { success: true, message: 'Đã xóa dự án thành công' };
  }

  async getMembers(projectId: string) {
    await this.findOne(projectId);
    const res = await this.db.query(
      `SELECT 
        pm.user_id,
        pm.role_in_project,
        pm.joined_at,
        u.full_name,
        u.email,
        u.role as system_role,
        u.avatar_url
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at ASC`,
      [projectId]
    );
    return res.rows;
  }

  async addMember(projectId: string, dto: AddMemberDto) {
    await this.findOne(projectId);

    const userId = dto.userId || dto.user_id;
    if (!userId) {
      throw new BadRequestException('userId hoặc user_id không được để trống');
    }

    // Kiểm tra user có tồn tại không
    const userRes = await this.db.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      throw new NotFoundException(`Không tìm thấy thành viên với ID: ${userId}`);
    }

    const roleInProject = dto.roleInProject || dto.role_in_project || 'MEMBER';

    await this.db.query(
      `INSERT INTO project_members (project_id, user_id, role_in_project)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) 
       DO UPDATE SET role_in_project = EXCLUDED.role_in_project`,
      [projectId, userId, roleInProject]
    );

    return this.getMembers(projectId);
  }

  async removeMember(projectId: string, userId: string) {
    await this.findOne(projectId);
    await this.db.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
    return { success: true, message: 'Đã xóa thành viên khỏi dự án' };
  }
}
