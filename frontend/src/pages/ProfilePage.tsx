import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersApi } from '../services/api';
import {
  User as UserIcon,
  Shield,
  KeyRound,
  CheckCircle2,
  Save,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !fullName.trim()) return;

    setSubmitting(true);
    try {
      const updated = await usersApi.update(user.id, {
        full_name: fullName.trim(),
      });
      setUser((prev) => (prev ? { ...prev, full_name: updated.full_name } : null));
      localStorage.setItem('user', JSON.stringify({ ...user, full_name: updated.full_name }));
      showSuccess('Cập nhật thông tin cá nhân thành công!');
    } catch {
      showError('Không thể cập nhật hồ sơ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <UserIcon className="w-6 h-6 text-indigo-400" />
          <span>Hồ Sơ Cá Nhân & Cài Đặt Tài Khoản</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Xem thông tin phiên đăng nhập, quyền hạn hệ thống và thông tin sinh viên thực hiện
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* User Card */}
        <div className="md:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <img
              src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
              alt={user?.full_name}
              className="w-24 h-24 rounded-full border-2 border-indigo-500/50 shadow-xl shadow-indigo-500/20 bg-slate-800 p-1"
            />
            <div className="absolute bottom-0 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>

          <h2 className="text-lg font-bold text-white">{user?.full_name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>

          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Vai trò: {user?.role}</span>
          </div>

          <div className="mt-6 w-full pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span>Trạng thái:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Mã ID:</span>
              <span className="font-mono text-slate-300">{user?.id?.substring(0, 13)}...</span>
            </div>
          </div>
        </div>

        {/* Update Profile Form */}
        <div className="md:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>Cập Nhật Thông Tin</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email tài khoản</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl text-xs text-slate-400 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-500 mt-1">Email được cố định để bảo mật dữ liệu.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Họ và tên hiển thị</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vai trò hệ thống</label>
              <input
                type="text"
                disabled
                value={user?.role || ''}
                className="w-full px-3.5 py-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl text-xs text-slate-400 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-500 mt-1">Chỉ Admin mới có thể thay đổi vai trò phân quyền.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || fullName === user?.full_name}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* System & Student Info Box */}
        <div className="md:col-span-12 glass-panel rounded-2xl p-6 border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-1">
                Thông Tin Đồ Án Chuyên Môn
              </div>
              <div className="text-base font-bold text-white">
                Đề tài 14 – Hệ thống Quản lý Dự án (Project Management)
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Sinh viên thực hiện: <strong className="text-white">Hoàng Xuân Đoàn</strong> (Mã SV/GitHub: <code className="text-indigo-300 font-mono">dtc245200226</code>)
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                PostgreSQL 16
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                NestJS 10
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                React 18 + Vite
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Prometheus + Grafana
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Loki + Promtail
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
