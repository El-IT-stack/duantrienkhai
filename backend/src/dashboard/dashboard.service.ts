import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getStats() {
    // 1. Thống kê tổng quan
    const countsRes = await this.db.query(`
      SELECT
        (SELECT COUNT(*)::int FROM projects) as total_projects,
        (SELECT COUNT(*)::int FROM projects WHERE status IN ('IN_PROGRESS', 'PLANNING')) as active_projects,
        (SELECT COUNT(*)::int FROM projects WHERE status = 'COMPLETED') as completed_projects,
        (SELECT COUNT(*)::int FROM users WHERE is_active = true) as total_members,
        (SELECT COUNT(*)::int FROM tasks) as total_tasks,
        (SELECT COUNT(*)::int FROM tasks WHERE status = 'DONE') as completed_tasks,
        (SELECT COUNT(*)::int FROM tasks WHERE status = 'IN_PROGRESS') as in_progress_tasks,
        (SELECT COUNT(*)::int FROM tasks WHERE due_date IS NOT NULL AND due_date < CURRENT_DATE AND status != 'DONE') as overdue_tasks
    `);

    // 2. Thống kê theo trạng thái công việc (cho biểu đồ tròn/cột)
    const statusDistributionRes = await this.db.query(`
      SELECT 
        status, 
        COUNT(*)::int as count
      FROM tasks
      GROUP BY status
    `);

    // 3. Thống kê theo mức độ ưu tiên
    const priorityDistributionRes = await this.db.query(`
      SELECT 
        priority, 
        COUNT(*)::int as count
      FROM tasks
      GROUP BY priority
    `);

    // 4. Dự án gần đây (kèm tiến độ %)
    const recentProjectsRes = await this.db.query(`
      SELECT 
        p.id, 
        p.name, 
        p.status, 
        p.start_date, 
        p.end_date,
        u.full_name as manager_name,
        COUNT(t.id)::int as total_tasks,
        COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::int as completed_tasks,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0 
          ELSE ROUND((COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::numeric / COUNT(t.id)::numeric) * 100) 
        END::int as progress_percent
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    // 5. Công việc sắp đến hạn hoặc quá hạn
    const upcomingTasksRes = await this.db.query(`
      SELECT 
        t.id, 
        t.title, 
        t.status, 
        t.priority, 
        t.due_date,
        p.name as project_name,
        u.full_name as assignee_name,
        u.avatar_url as assignee_avatar,
        CASE 
          WHEN t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status != 'DONE' 
          THEN true 
          ELSE false 
        END as is_overdue
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.status != 'DONE' AND t.due_date IS NOT NULL
      ORDER BY t.due_date ASC
      LIMIT 6
    `);

    return {
      summary: countsRes.rows[0],
      taskStatusDistribution: statusDistributionRes.rows,
      taskPriorityDistribution: priorityDistributionRes.rows,
      recentProjects: recentProjectsRes.rows,
      upcomingTasks: upcomingTasksRes.rows,
    };
  }
}
