import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import { DashboardStats } from '../types';
import { useToast } from '../context/ToastContext';
import {
  FolderGit2,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { showError } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch {
      showError('Không thể tải dữ liệu thống kê Dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TODO':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700">Cần làm</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">Đang làm</span>;
      case 'REVIEW':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Đang duyệt</span>;
      case 'DONE':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Hoàn thành</span>;
      case 'PLANNING':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">Kế hoạch</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Hoàn tất</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">Khẩn cấp</span>;
      case 'HIGH':
        return <span className="text-[11px] font-semibold text-amber-400">Cao</span>;
      case 'MEDIUM':
        return <span className="text-[11px] text-sky-400">Trung bình</span>;
      default:
        return <span className="text-[11px] text-slate-400">Thấp</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Bảng Điều Khiển Tổng Quan</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Theo dõi tiến độ dự án, phân bổ công việc và cảnh báo tiến độ thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
          <Link
            to="/projects"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Dự Án</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Projects */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng số Dự án</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '-' : stats?.summary?.total_projects || 0}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">Đang hoạt động</span>
          </div>
        </div>

        {/* Total Members */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Thành viên Hoạt động</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '-' : stats?.summary?.total_members || 0}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Đã gán vai trò RBAC
          </div>
        </div>

        {/* Total Tasks & Completed */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Công việc hoàn thành</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '-' : `${stats?.summary?.completed_tasks || 0} / ${stats?.summary?.total_tasks || 0}`}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Tỷ lệ hoàn thành: {stats?.summary?.total_tasks ? Math.round(((stats.summary.completed_tasks || 0) / stats.summary.total_tasks) * 100) : 0}%
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 bg-rose-950/10">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">Công việc Quá Hạn</span>
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-300">
            {loading ? '-' : stats?.summary?.overdue_tasks || 0}
          </div>
          <div className="text-xs text-rose-400/80 mt-2 font-medium">
            Cần giải quyết ngay
          </div>
        </div>
      </div>

      {/* Main Grid: Projects Progress & Tasks Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Projects with Progress */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Tiến Độ Dự Án Trọng Điểm</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Tiến độ thực tế tính theo số công việc hoàn tất</p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats?.recentProjects && stats.recentProjects.length > 0 ? (
              stats.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-800/40 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {project.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Quản lý: <span className="text-slate-300 font-medium">{project.manager_name || 'Chưa gán'}</span>
                      </div>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">
                        {project.completed_tasks} / {project.total_tasks} công việc
                      </span>
                      <span className="font-bold text-indigo-400">
                        {project.progress_percent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                        style={{ width: `${project.progress_percent || 0}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                Chưa có dữ liệu dự án
              </div>
            )}
          </div>
        </div>

        {/* Task Distribution & Urgent Alerts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Distribution Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Phân Bổ Trạng Thái Công Việc</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {stats?.taskStatusDistribution?.map((item) => (
                <div
                  key={item.status}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="text-xs font-semibold text-slate-300">
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming or Overdue Tasks */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Nhiệm Vụ Cần Chú Ý</span>
              </h3>
              <Link to="/tasks" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                Kanban Board →
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.upcomingTasks && stats.upcomingTasks.length > 0 ? (
                stats.upcomingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      task.is_overdue
                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white truncate mb-0.5">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {task.project_name} • Hạn: {task.due_date || 'Không có'}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {getPriorityBadge(task.priority)}
                      {task.is_overdue && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500 text-white">
                          QUÁ HẠN
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Không có công việc nào sắp hết hạn
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
