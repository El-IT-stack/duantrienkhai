import axios, { AxiosError } from 'axios';
import {
  AuthResponse,
  DashboardStats,
  Project,
  ProjectMember,
  Task,
  TaskComment,
  User,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gắn Bearer Token tự động vào mỗi request nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý response lỗi toàn cục
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 1. Authentication APIs
export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },
  register: async (data: { email: string; password: string; full_name: string; role?: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },
  getProfile: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};

// 2. Dashboard APIs
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<DashboardStats>('/dashboard');
    return res.data;
  },
};

// 3. Projects APIs
export const projectsApi = {
  getAll: async (params?: { search?: string; status?: string }): Promise<Project[]> => {
    const res = await api.get<Project[]>('/projects', { params });
    return res.data;
  },
  getOne: async (id: string): Promise<Project> => {
    const res = await api.get<Project>(`/projects/${id}`);
    return res.data;
  },
  create: async (data: Partial<Project>): Promise<Project> => {
    const res = await api.post<Project>('/projects', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const res = await api.patch<Project>(`/projects/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
  getMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const res = await api.get<ProjectMember[]>(`/projects/${projectId}/members`);
    return res.data;
  },
  addMember: async (projectId: string, data: { user_id: string; role_in_project?: string }): Promise<void> => {
    await api.post(`/projects/${projectId}/members`, data);
  },
  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  },
};

// 4. Tasks APIs
export const tasksApi = {
  getAll: async (params?: {
    projectId?: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
    search?: string;
    isOverdue?: boolean;
  }): Promise<Task[]> => {
    const res = await api.get<Task[]>('/tasks', { params });
    return res.data;
  },
  getOne: async (id: string): Promise<Task> => {
    const res = await api.get<Task>(`/tasks/${id}`);
    return res.data;
  },
  create: async (data: Partial<Task>): Promise<Task> => {
    const res = await api.post<Task>('/tasks', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    const res = await api.patch<Task>(`/tasks/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: string, data: { status: string; position?: number }): Promise<Task> => {
    const res = await api.patch<Task>(`/tasks/${id}/status`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
  addComment: async (taskId: string, content: string): Promise<TaskComment> => {
    const res = await api.post<TaskComment>(`/tasks/${taskId}/comments`, { content });
    return res.data;
  },
  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/tasks/comments/${commentId}`);
  },
};

// 5. Users APIs
export const usersApi = {
  getAll: async (params?: { search?: string; role?: string }): Promise<User[]> => {
    const res = await api.get<User[]>('/users', { params });
    return res.data;
  },
  getOne: async (id: string): Promise<User> => {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
  },
  create: async (data: Partial<User> & { password?: string }): Promise<User> => {
    const res = await api.post<User>('/users', data);
    return res.data;
  },
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const res = await api.patch<User>(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export default api;
