import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  LogOut,
  FolderKanban,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout, login } = useAuth();
  const { showSuccess, showError } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);

  // Danh sách tài khoản demo để kiểm thử RBAC nhanh chóng
  const demoAccounts = [
    { label: 'Admin (Toàn quyền)', email: 'admin@pm.local', role: 'ADMIN' },
    { label: 'PM Minh (Quản lý dự án)', email: 'pm.minh@pm.local', role: 'PROJECT_MANAGER' },
    { label: 'Dev Tuấn (Lập trình viên)', email: 'dev.tuan@pm.local', role: 'MEMBER' },
    { label: 'QA Nam (Kiểm thử viên)', email: 'qa.nam@pm.local', role: 'MEMBER' },
  ];

  const handleQuickSwitch = async (email: string) => {
    setSwitchLoading(true);
    try {
      await login(email, 'Admin@123');
      showSuccess(`Đã chuyển đổi sang tài khoản: ${email}`, 'Chuyển vai trò thành công');
      setDropdownOpen(false);
    } catch {
      showError('Không thể chuyển đổi tài khoản demo');
    } finally {
      setSwitchLoading(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">ADMIN</span>;
      case 'PROJECT_MANAGER':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">PM</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">MEMBER</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <FolderKanban className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                ProjectHub
              </div>
              <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                Đề tài 14 • QL Dự án
              </div>
            </div>
          </Link>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick RBAC Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-colors"
              title="Chuyển nhanh tài khoản để kiểm thử phân quyền RBAC"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Chuyển vai trò test</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-800">
                  Kiểm thử phân quyền RBAC
                </div>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    disabled={switchLoading || user?.email === acc.email}
                    onClick={() => handleQuickSwitch(acc.email)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      user?.email === acc.email
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold cursor-default'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div>{acc.label}</div>
                      <div className="text-[10px] text-slate-500">{acc.email}</div>
                    </div>
                    {getRoleBadge(acc.role)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Docs & Prometheus quick links */}
          <a
            href="/api/docs"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <span>Swagger API</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <Link to="/profile" className="flex items-center gap-2.5 group">
              <img
                src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                alt={user?.full_name}
                className="w-8 h-8 rounded-full border border-slate-700 group-hover:border-indigo-500 transition-colors bg-slate-800"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate max-w-[140px]">
                  {user?.full_name}
                </div>
                <div className="flex items-center gap-1.5">
                  {getRoleBadge(user?.role)}
                </div>
              </div>
            </Link>

            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
