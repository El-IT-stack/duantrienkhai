import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import {
  FolderKanban,
  ShieldCheck,
  Briefcase,
  Code2,
  Bug,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER'>('MEMBER');
  const [loading, setLoading] = useState(false);

  // Danh sách tài khoản demo
  const demoPresets = [
    {
      title: 'Quản trị viên (Admin)',
      email: 'admin@pm.local',
      role: 'ADMIN',
      icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
      desc: 'Toàn quyền thêm sửa xóa dự án, thành viên, cấu hình',
      border: 'hover:border-rose-500/50 hover:bg-rose-500/10',
    },
    {
      title: 'Trưởng dự án (PM Minh)',
      email: 'pm.minh@pm.local',
      role: 'PROJECT_MANAGER',
      icon: <Briefcase className="w-5 h-5 text-amber-400" />,
      desc: 'Quản lý dự án PMS, phân công công việc, gán thành viên',
      border: 'hover:border-amber-500/50 hover:bg-amber-500/10',
    },
    {
      title: 'Backend Dev (Tuấn)',
      email: 'dev.tuan@pm.local',
      role: 'MEMBER',
      icon: <Code2 className="w-5 h-5 text-indigo-400" />,
      desc: 'Nhận task, cập nhật tiến độ Kanban và bình luận',
      border: 'hover:border-indigo-500/50 hover:bg-indigo-500/10',
    },
    {
      title: 'Kiểm thử viên (Nam QA)',
      email: 'qa.nam@pm.local',
      role: 'MEMBER',
      icon: <Bug className="w-5 h-5 text-emerald-400" />,
      desc: 'Kiểm thử tính năng, rà soát lỗi và cập nhật task',
      border: 'hover:border-emerald-500/50 hover:bg-emerald-500/10',
    },
  ];

  const handleDemoLogin = async (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('Admin@123');
    setLoading(true);
    try {
      await login(presetEmail, 'Admin@123');
      showSuccess('Đăng nhập tài khoản demo thành công!', 'Chào mừng trở lại');
      navigate('/dashboard');
    } catch {
      showError('Đăng nhập thất bại. Vui lòng kiểm tra lại');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (!fullName) {
          showError('Vui lòng nhập họ và tên');
          setLoading(false);
          return;
        }
        await authApi.register({ email, password, full_name: fullName, role });
        showSuccess('Đăng ký tài khoản thành công! Tự động đăng nhập...');
        await login(email, password);
      } else {
        await login(email, password);
        showSuccess('Đăng nhập thành công!', 'ProjectHub');
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      showError(Array.isArray(msg) ? msg.join(', ') : msg || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/30 mb-4">
          <FolderKanban className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          ProjectHub System
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Đề tài 14 – Hệ thống Quản lý Dự án & Giám sát Toàn diện
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Login/Register Form */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex border-b border-slate-800 pb-3 mb-6">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-colors ${
                !isRegister ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-colors ${
                isRegister ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Đăng ký mới
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Họ và tên</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email tài khoản</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pm.local"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vai trò đăng ký</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="MEMBER">Thành viên (Member)</option>
                  <option value="PROJECT_MANAGER">Quản lý dự án (Project Manager)</option>
                  <option value="ADMIN">Quản trị hệ thống (Admin)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:opacity-95 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Tạo tài khoản & Đăng nhập' : 'Đăng nhập vào hệ thống'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Hệ thống hỗ trợ PostgreSQL, Docker Compose, Nginx, Prometheus & Loki.
          </div>
        </div>

        {/* Right column: Quick 1-Click Demo Login Presets */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center gap-2 mb-2 text-slate-300 text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Tài khoản Demo có sẵn (Đăng nhập 1-Click)</span>
          </div>

          {demoPresets.map((preset) => (
            <button
              key={preset.email}
              disabled={loading}
              onClick={() => handleDemoLogin(preset.email)}
              className={`w-full text-left p-4 rounded-2xl bg-slate-900/60 border border-slate-800 transition-all duration-200 ${preset.border} group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-105 transition-transform">
                    {preset.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                      {preset.title}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {preset.email} (Pass: Admin@123)
                    </div>
                  </div>
                </div>
                <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 group-hover:border-indigo-500/50 group-hover:text-indigo-300 transition-colors">
                  Đăng nhập
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed pl-12">
                {preset.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
