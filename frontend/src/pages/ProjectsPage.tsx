import React, { useEffect, useState } from 'react';
import { projectsApi, usersApi } from '../services/api';
import { Project, ProjectStatus, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FolderGit2,
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  Eye,
  X,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectsPage: React.FC = () => {
  const { isPM } = useAuth();
  const { showSuccess, showError } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<ProjectStatus>('PLANNING');
  const [formManagerId, setFormManagerId] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectsApi.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setProjects(data);
    } catch {
      showError('Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const users = await usersApi.getAll();
      setManagers(users.filter((u) => u.role === 'ADMIN' || u.role === 'PROJECT_MANAGER'));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchManagers();
  }, [search, statusFilter]);

  const handleOpenCreateModal = () => {
    setCurrentProject(null);
    setFormName('');
    setFormDesc('');
    setFormStatus('PLANNING');
    setFormManagerId(managers[0]?.id || '');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Project) => {
    setCurrentProject(p);
    setFormName(p.name);
    setFormDesc(p.description || '');
    setFormStatus(p.status);
    setFormManagerId(p.manager_id || '');
    setFormStartDate(p.start_date ? p.start_date.split('T')[0] : '');
    setFormEndDate(p.end_date ? p.end_date.split('T')[0] : '');
    setIsModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showError('Vui lòng nhập tên dự án');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        description: formDesc.trim(),
        status: formStatus,
        manager_id: formManagerId || undefined,
        start_date: formStartDate || undefined,
        end_date: formEndDate || undefined,
      };

      if (currentProject?.id) {
        await projectsApi.update(currentProject.id, payload);
        showSuccess('Cập nhật dự án thành công!');
      } else {
        await projectsApi.create(payload);
        showSuccess('Tạo mới dự án thành công!');
      }

      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dự án');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject?.id) return;
    setSubmitting(true);
    try {
      await projectsApi.delete(currentProject.id);
      showSuccess('Đã xóa dự án thành công!');
      setIsDeleteModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể xóa dự án');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'PLANNING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">Lên kế hoạch</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20">Đang triển khai</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-400 border border-slate-700">Đã hủy</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-indigo-400" />
            <span>Quản Lý Danh Sách Dự Án</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tổng quan và quản lý tất cả các dự án, tiến độ hoàn thành và phân công quản lý
          </p>
        </div>

        {isPM && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Dự Án Mới</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm dự án theo tên hoặc mô tả..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PLANNING">Lên kế hoạch</option>
          <option value="IN_PROGRESS">Đang triển khai</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-2xl p-6 h-48 animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Không tìm thấy dự án nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc nhấn nút "Thêm Dự Án Mới" để tạo dự án đầu tiên.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div
              key={p.id}
              className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between border border-slate-800 relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  {getStatusBadge(p.status)}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                  {p.description || 'Không có mô tả chi tiết cho dự án này.'}
                </p>

                {/* Dates & Manager */}
                <div className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span>Quản lý:</span>
                    <span className="font-semibold text-slate-200">{p.manager_name || 'Chưa phân công'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Thời hạn:
                    </span>
                    <span>
                      {p.start_date ? p.start_date.split('T')[0] : 'N/A'} → {p.end_date ? p.end_date.split('T')[0] : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Tiến độ ({p.completed_tasks || 0}/{p.total_tasks || 0} tasks)</span>
                  <span className="font-bold text-indigo-400">{p.progress_percent || 0}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${p.progress_percent || 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`/projects/${p.id}`}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-center bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Chi tiết & Thành viên</span>
                  </Link>

                  {isPM && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentProject(p);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/20 transition-colors"
                        title="Xóa dự án"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white">
                {currentProject?.id ? 'Chỉnh Sửa Dự Án' : 'Thêm Mới Dự Án'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên dự án <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nền tảng E-Commerce AI..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mô tả dự án</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Mô tả mục tiêu, yêu cầu kỹ thuật và phạm vi triển khai..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trạng thái</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PLANNING">Lên kế hoạch</option>
                    <option value="IN_PROGRESS">Đang triển khai</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Quản lý dự án (PM)</label>
                  <select
                    value={formManagerId}
                    onChange={(e) => setFormManagerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Chưa gán --</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{currentProject?.id ? 'Lưu thay đổi' : 'Tạo dự án'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/30 shadow-2xl p-6">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Xác Nhận Xóa Dự Án?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa dự án <strong className="text-rose-300">"{currentProject?.name}"</strong>?
              Toàn bộ công việc (Tasks), liên kết thành viên và bình luận liên quan sẽ bị xóa tự động theo ràng buộc cơ sở dữ liệu (CASCADE).
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteProject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
