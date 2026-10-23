import React, { useEffect, useState } from 'react';
import { tasksApi, projectsApi, usersApi } from '../services/api';
import { Task, TaskStatus, TaskPriority, Project, User, TaskComment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Edit2,
  Trash2,
  Columns,
  List,
  Send,
  X,
  AlertCircle,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Task Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formAssigneeId, setFormAssigneeId] = useState('');
  const [formStatus, setFormStatus] = useState<TaskStatus>('TODO');
  const [formPriority, setFormPriority] = useState<TaskPriority>('MEDIUM');
  const [formDueDate, setFormDueDate] = useState('');

  // Comment State
  const [activeTaskComments, setActiveTaskComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksData, projectsData, usersData] = await Promise.all([
        tasksApi.getAll({
          search: search || undefined,
          projectId: selectedProjectId || undefined,
          assigneeId: selectedAssigneeId || undefined,
          priority: selectedPriority || undefined,
          isOverdue: filterOverdue || undefined,
        }),
        projectsApi.getAll(),
        usersApi.getAll(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setUsers(usersData);
    } catch {
      showError('Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedProjectId, selectedAssigneeId, selectedPriority, filterOverdue]);

  const handleOpenCreateModal = () => {
    setCurrentTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormProjectId(projects[0]?.id || '');
    setFormAssigneeId(user?.id || '');
    setFormStatus('TODO');
    setFormPriority('MEDIUM');
    setFormDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (t: Task) => {
    setCurrentTask(t);
    setFormTitle(t.title);
    setFormDesc(t.description || '');
    setFormProjectId(t.project_id);
    setFormAssigneeId(t.assignee_id || '');
    setFormStatus(t.status);
    setFormPriority(t.priority);
    setFormDueDate(t.due_date ? t.due_date.split('T')[0] : '');
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showError('Vui lòng nhập tiêu đề công việc');
      return;
    }
    if (!formProjectId) {
      showError('Vui lòng chọn dự án thuộc về');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        description: formDesc.trim(),
        project_id: formProjectId,
        assignee_id: formAssigneeId || undefined,
        status: formStatus,
        priority: formPriority,
        due_date: formDueDate || undefined,
      };

      if (currentTask?.id) {
        await tasksApi.update(currentTask.id, payload);
        showSuccess('Cập nhật công việc thành công!');
      } else {
        await tasksApi.create(payload);
        showSuccess('Tạo công việc mới thành công!');
      }

      setIsTaskModalOpen(false);
      fetchData();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu công việc');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateStatus(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      showSuccess(`Đã chuyển trạng thái sang ${newStatus}`);
    } catch {
      showError('Không thể cập nhật trạng thái');
    }
  };

  const handleDeleteTask = async () => {
    if (!currentTask?.id) return;
    setSubmitting(true);
    try {
      await tasksApi.delete(currentTask.id);
      showSuccess('Đã xóa công việc thành công!');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể xóa công việc');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenComments = async (t: Task) => {
    setCurrentTask(t);
    setIsCommentsModalOpen(true);
    try {
      const detail = await tasksApi.getOne(t.id);
      setActiveTaskComments(detail.comments || []);
    } catch {
      showError('Không thể tải bình luận');
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask?.id || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const added = await tasksApi.addComment(currentTask.id, newComment.trim());
      setActiveTaskComments((prev) => [...prev, added]);
      setNewComment('');
      showSuccess('Đã gửi bình luận');
    } catch {
      showError('Không thể gửi bình luận');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">Khẩn cấp</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Cao</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">Trung bình</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-400 border border-slate-700">Thấp</span>;
    }
  };

  const columns: { id: TaskStatus; title: string; color: string; border: string }[] = [
    { id: 'TODO', title: 'CẦN LÀM (TO DO)', color: 'text-slate-300', border: 'border-slate-700' },
    { id: 'IN_PROGRESS', title: 'ĐANG LÀM (IN PROGRESS)', color: 'text-sky-400', border: 'border-sky-500/40' },
    { id: 'REVIEW', title: 'ĐANG DUYỆT (REVIEW)', color: 'text-amber-400', border: 'border-amber-500/40' },
    { id: 'DONE', title: 'HOÀN THÀNH (DONE)', color: 'text-emerald-400', border: 'border-emerald-500/40' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-indigo-400" />
            <span>Quản Lý Công Việc (Tasks & Kanban)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Theo dõi phân công, deadline, tiến độ 4 cột Kanban và tương tác bình luận
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Giao diện Kanban Board"
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Giao diện Danh sách Table"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Danh sách</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Công Việc</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc mô tả..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả dự án</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={selectedAssigneeId}
          onChange={(e) => setSelectedAssigneeId(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả người thực hiện</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name} ({u.role})
            </option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả mức ưu tiên</option>
          <option value="LOW">Thấp</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HIGH">Cao</option>
          <option value="URGENT">Khẩn cấp</option>
        </select>

        <button
          onClick={() => setFilterOverdue(!filterOverdue)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
            filterOverdue
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Chỉ xem Quá Hạn</span>
        </button>
      </div>

      {loading && (
        <div className="py-12 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
          <div className="text-xs">Đang cập nhật danh sách công việc...</div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {!loading && viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="glass-panel rounded-2xl border border-slate-800 flex flex-col min-h-[500px] overflow-hidden"
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b ${col.border} bg-slate-900/60 flex items-center justify-between`}>
                  <div className={`text-xs font-bold ${col.color} flex items-center gap-2`}>
                    <span>{col.title}</span>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      Không có công việc
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between transition-all group ${
                          task.is_overdue
                            ? 'bg-rose-950/20 border-rose-500/40 shadow-md shadow-rose-950/40'
                            : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-semibold text-indigo-400 truncate max-w-[140px]">
                              {task.project_name}
                            </span>
                            {getPriorityBadge(task.priority)}
                          </div>

                          <h4 className="font-bold text-white text-xs mb-1.5 group-hover:text-indigo-300 transition-colors line-clamp-2">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {task.due_date ? task.due_date.split('T')[0] : 'Không có'}
                            </span>
                            {task.is_overdue && (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                                QUÁ HẠN
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <img
                                src={task.assignee_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                                alt={task.assignee_name}
                                className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800"
                              />
                              <span className="text-[11px] text-slate-300 font-medium truncate max-w-[90px]">
                                {task.assignee_name || 'Chưa gán'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenComments(task)}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors flex items-center gap-0.5 text-[10px]"
                                title="Bình luận"
                              >
                                <MessageSquare className="w-3 h-3" />
                                {task.comments_count ? <span>{task.comments_count}</span> : null}
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(task)}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                                title="Sửa"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setCurrentTask(task);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Quick move dropdown */}
                          <div className="pt-1 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">Chuyển:</span>
                            <select
                              value={task.status}
                              onChange={(e) => handleQuickStatusChange(task.id, e.target.value as TaskStatus)}
                              className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="REVIEW">Review</option>
                              <option value="DONE">Done</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Công việc</th>
                  <th className="py-3 px-4">Dự án</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Mức ưu tiên</th>
                  <th className="py-3 px-4">Người làm</th>
                  <th className="py-3 px-4">Hạn chót</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{task.project_name}</td>
                    <td className="py-3 px-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleQuickStatusChange(task.id, e.target.value as TaskStatus)}
                        className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">{getPriorityBadge(task.priority)}</td>
                    <td className="py-3 px-4 text-slate-300">{task.assignee_name || 'Chưa gán'}</td>
                    <td className="py-3 px-4">
                      <span className={task.is_overdue ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {task.due_date ? task.due_date.split('T')[0] : 'N/A'}
                        {task.is_overdue && ' (Quá hạn)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenComments(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60"
                          title="Bình luận"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60"
                          title="Sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentTask(task);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-800/60"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">
                {currentTask?.id ? 'Chỉnh Sửa Công Việc' : 'Tạo Công Việc Mới'}
              </h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tiêu đề công việc <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Thiết kế cơ sở dữ liệu..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mô tả công việc</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Mô tả chi tiết yêu cầu kỹ thuật và kết quả mong đợi..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dự án tương ứng <span className="text-rose-400">*</span>
                  </label>
                  <select
                    required
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Chọn dự án --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Người thực hiện</label>
                  <select
                    value={formAssigneeId}
                    onChange={(e) => setFormAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Chưa gán --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Trạng thái</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mức ưu tiên</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Thời hạn (Due Date)</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
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
                  <span>{currentTask?.id ? 'Lưu thay đổi' : 'Tạo công việc'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {isCommentsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Trao Đổi / Bình Luận Công Việc</span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">
                  {currentTask?.title}
                </div>
              </div>
              <button onClick={() => setIsCommentsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[220px]">
              {activeTaskComments.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Chưa có bình luận nào cho công việc này. Hãy là người đầu tiên trao đổi!
                </div>
              ) : (
                activeTaskComments.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={c.user_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                          alt={c.user_name}
                          className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800"
                        />
                        <span className="font-bold text-slate-200">{c.user_name}</span>
                        {c.user_role && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                            {c.user_role}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-7">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSendComment} className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Nhập nội dung trao đổi hoặc cập nhật tiến độ..."
                className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TASK CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/30 shadow-2xl p-6">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Xác Nhận Xóa Công Việc?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa công việc <strong className="text-rose-300">"{currentTask?.title}"</strong>?
              Thao tác này không thể hoàn tác.
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
                onClick={handleDeleteTask}
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
