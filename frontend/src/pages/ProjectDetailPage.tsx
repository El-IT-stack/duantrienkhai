import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectsApi, usersApi, tasksApi } from '../services/api';
import { Project, ProjectMember, Task, User, ProjectMemberRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FolderGit2,
  Calendar,
  Users,
  CheckSquare,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Plus,
  X,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isPM } = useAuth();
  const { showSuccess, showError } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Active tab: 'members' | 'tasks'
  const [activeTab, setActiveTab] = useState<'tasks' | 'members'>('tasks');

  // Add Member Modal
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleInProject, setSelectedRoleInProject] = useState<ProjectMemberRole>('MEMBER');
  const [submittingMember, setSubmittingMember] = useState(false);

  const fetchProjectData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [projData, membersData, tasksData, usersData] = await Promise.all([
        projectsApi.getOne(id),
        projectsApi.getMembers(id),
        tasksApi.getAll({ projectId: id }),
        usersApi.getAll(),
      ]);
      setProject(projData);
      setMembers(membersData);
      setTasks(tasksData);
      setAllUsers(usersData);
    } catch {
      showError('Không thể tải thông tin dự án');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedUserId) {
      showError('Vui lòng chọn thành viên');
      return;
    }

    setSubmittingMember(true);
    try {
      await projectsApi.addMember(id, {
        user_id: selectedUserId,
        role_in_project: selectedRoleInProject,
      });
      showSuccess('Gán thành viên vào dự án thành công!');
      setIsAddMemberModalOpen(false);
      setSelectedUserId('');
      const updatedMembers = await projectsApi.getMembers(id);
      setMembers(updatedMembers);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể gán thành viên');
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!id) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}" khỏi dự án này?`)) return;

    try {
      await projectsApi.removeMember(id, userId);
      showSuccess('Đã xóa thành viên khỏi dự án');
      setMembers(members.filter((m) => m.user_id !== userId));
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể xóa thành viên');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
        <div className="text-sm">Đang tải chi tiết dự án...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-white">Không tìm thấy dự án</h2>
        <Link to="/projects" className="text-indigo-400 text-sm mt-3 inline-block">
          ← Quay lại danh sách dự án
        </Link>
      </div>
    );
  }

  // Lọc những user chưa có trong dự án để thêm vào
  const existingUserIds = new Set(members.map((m) => m.user_id));
  const availableUsersToAdd = allUsers.filter((u) => !existingUserIds.has(u.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back button & Title */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">{project.description || 'Chưa có mô tả chi tiết.'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tasks"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Công Việc</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Project Meta Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Quản lý dự án</span>
          <div className="text-sm font-bold text-white mt-1 truncate">
            {project.manager_name || 'Chưa phân công'}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Thời gian thực hiện</span>
          <div className="text-xs font-medium text-slate-200 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{project.start_date ? project.start_date.split('T')[0] : 'N/A'} → {project.end_date ? project.end_date.split('T')[0] : 'N/A'}</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Tổng số công việc</span>
          <div className="text-sm font-bold text-white mt-1">
            {project.completed_tasks || 0} / {project.total_tasks || 0} tasks
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Tiến độ thực tế</span>
          <div className="text-sm font-bold text-indigo-400 mt-1">
            {project.progress_percent || 0}%
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'tasks'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Danh Sách Công Việc ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Thành Viên Tham Gia ({members.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800">
              <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-300">Chưa có công việc nào trong dự án này</div>
              <p className="text-xs text-slate-500 mt-1">
                Hãy chuyển sang trang Công Việc hoặc nhấn "Tạo Công Việc" để bắt đầu giao việc.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="glass-panel p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-3 hover:border-indigo-500/30 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white truncate">{task.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {task.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                      {task.description || 'Không có mô tả'}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span>Người làm: <strong className="text-slate-300">{task.assignee_name || 'Chưa gán'}</strong></span>
                      <span>Hạn: <strong className="text-slate-300">{task.due_date ? task.due_date.split('T')[0] : 'N/A'}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Thành viên thuộc dự án có quyền theo dõi và thực hiện các công việc được giao.
            </div>
            {isPM && (
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Gán Thành Viên Mới</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => (
              <div
                key={m.user_id}
                className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={m.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                    alt={m.full_name}
                    className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{m.full_name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{m.email}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {m.role_in_project}
                      </span>
                    </div>
                  </div>
                </div>

                {isPM && (
                  <button
                    onClick={() => handleRemoveMember(m.user_id, m.full_name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Xóa khỏi dự án"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Gán Thành Viên Vào Dự Án</h3>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chọn người dùng <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Chọn thành viên khả dụng --</option>
                  {availableUsersToAdd.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email} - {u.role})
                    </option>
                  ))}
                </select>
                {availableUsersToAdd.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1">
                    Tất cả người dùng trong hệ thống đều đã tham gia dự án này.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vai trò trong dự án</label>
                <select
                  value={selectedRoleInProject}
                  onChange={(e) => setSelectedRoleInProject(e.target.value as ProjectMemberRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="MANAGER">MANAGER (Trưởng dự án)</option>
                  <option value="LEAD">LEAD (Nhóm trưởng kỹ thuật)</option>
                  <option value="MEMBER">MEMBER (Thành viên thực hiện)</option>
                  <option value="VIEWER">VIEWER (Chỉ xem)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingMember || availableUsersToAdd.length === 0}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {submittingMember ? 'Đang thêm...' : 'Gán thành viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
