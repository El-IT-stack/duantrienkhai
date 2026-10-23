import React, { useEffect, useState } from 'react';
import { usersApi } from '../services/api';
import { User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Briefcase,
  User as UserIcon,
  Edit2,
  Trash2,
  Mail,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
} from 'lucide-react';

export const MembersPage: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('MEMBER');
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setMembers(data);
    } catch {
      showError('Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search, roleFilter]);

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setFormEmail('');
    setFormPassword('');
    setFormFullName('');
    setFormRole('MEMBER');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setSelectedUser(u);
    setFormEmail(u.email);
    setFormPassword('');
    setFormFullName(u.full_name);
    setFormRole(u.role);
    setFormIsActive(u.is_active);
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim()) {
      showError('Vui lòng nhập họ và tên');
      return;
    }
    if (!selectedUser?.id && (!formEmail || !formPassword)) {
      showError('Vui lòng nhập email và mật khẩu khởi tạo');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedUser?.id) {
        // Cập nhật thông tin
        await usersApi.update(selectedUser.id, {
          full_name: formFullName.trim(),
          role: formRole,
          is_active: formIsActive,
        });
        showSuccess('Cập nhật thông tin thành viên thành công!');
      } else {
        // Tạo mới
        await usersApi.create({
          email: formEmail.trim(),
          password: formPassword,
          full_name: formFullName.trim(),
          role: formRole,
        });
        showSuccess('Tạo tài khoản thành viên thành công!');
      }

      setIsModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu người dùng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedUser?.id) return;
    if (selectedUser.id === currentUser?.id) {
      showError('Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }

    setSubmitting(true);
    try {
      await usersApi.delete(selectedUser.id);
      showSuccess('Đã xóa thành viên thành công!');
      setIsDeleteModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Không thể xóa thành viên');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMIN
          </span>
        );
      case 'PROJECT_MANAGER':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            PM
          </span>
        );
      case 'MEMBER':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5" />
            MEMBER
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Quản Lý Thành Viên & Phân Quyền (RBAC)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quản trị danh sách người dùng, trạng thái kích hoạt và phân quyền Admin, PM, Member
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Thành Viên Mới</span>
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
            placeholder="Tìm theo họ tên hoặc email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị viên (Admin)</option>
          <option value="PROJECT_MANAGER">Quản lý dự án (PM)</option>
          <option value="MEMBER">Thành viên (Member)</option>
        </select>
      </div>

      {/* Members Grid / Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-2xl p-6 h-36 animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Không tìm thấy thành viên nào</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div
              key={m.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                      alt={m.full_name}
                      className="w-11 h-11 rounded-full border border-slate-700 bg-slate-800"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {m.full_name}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[150px]">{m.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">{getRoleBadge(m.role)}</div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    {m.is_active ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 font-medium">
                        <XCircle className="w-3.5 h-3.5" />
                        Bị vô hiệu hóa
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ID: {m.id.substring(0, 8)}...
                  </span>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(m)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Sửa</span>
                  </button>
                  {m.id !== currentUser?.id && (
                    <button
                      onClick={() => {
                        setSelectedUser(m);
                        setIsDeleteModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-white bg-slate-800 hover:bg-rose-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">
                {selectedUser?.id ? 'Chỉnh Sửa Thông Tin Thành Viên' : 'Thêm Thành Viên Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ và tên <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Xuân Đoàn..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {!selectedUser?.id && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email đăng nhập <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="user@pm.local"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mật khẩu khởi tạo <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Vai trò phân quyền</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="MEMBER">Thành viên (Member)</option>
                  <option value="PROJECT_MANAGER">Quản lý dự án (Project Manager)</option>
                  <option value="ADMIN">Quản trị viên (Admin)</option>
                </select>
              </div>

              {selectedUser?.id && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                    Kích hoạt tài khoản (Active)
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{selectedUser?.id ? 'Lưu thay đổi' : 'Tạo thành viên'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/30 shadow-2xl p-6">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Xác Nhận Xóa Người Dùng?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa tài khoản của thành viên{' '}
              <strong className="text-rose-300">"{selectedUser?.full_name}"</strong> ({selectedUser?.email})?
              Dữ liệu sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu PostgreSQL.
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
                onClick={handleDeleteMember}
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
