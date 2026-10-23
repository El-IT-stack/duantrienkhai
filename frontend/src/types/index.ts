export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER';

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ProjectMemberRole = 'MANAGER' | 'LEAD' | 'MEMBER' | 'VIEWER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  role_in_project: ProjectMemberRole;
  avatar_url?: string;
  joined_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  manager_id?: string;
  manager_name?: string;
  manager_email?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  total_tasks?: number;
  completed_tasks?: number;
  progress_percent?: number;
  members?: ProjectMember[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  user_role?: UserRole;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  project_name?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  assignee_name?: string;
  assignee_email?: string;
  assignee_avatar?: string;
  creator_id?: string;
  creator_name?: string;
  due_date?: string;
  position?: number;
  created_at?: string;
  updated_at?: string;
  is_overdue?: boolean;
  comments_count?: number;
  comments?: TaskComment[];
}

export interface DashboardStats {
  summary: {
    total_projects: number;
    active_projects?: number;
    completed_projects?: number;
    total_members: number;
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    overdue_tasks: number;
  };
  taskStatusDistribution: {
    status: TaskStatus;
    count: number;
  }[];
  taskPriorityDistribution: {
    priority: TaskPriority;
    count: number;
  }[];
  recentProjects: Project[];
  upcomingTasks: Task[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
