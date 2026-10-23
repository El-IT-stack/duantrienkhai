import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  Users,
  UserCheck,
  Activity,
  Database,
  BarChart3,
  Server,
} from 'lucide-react';

export const Sidebar: React.FC = () => {

  const navItems = [
    {
      to: '/dashboard',
      label: 'Tổng quan',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      to: '/projects',
      label: 'Dự án',
      icon: <FolderGit2 className="w-5 h-5" />,
    },
    {
      to: '/tasks',
      label: 'Công việc (Kanban)',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      to: '/members',
      label: 'Thành viên',
      icon: <Users className="w-5 h-5" />,
    },
    {
      to: '/profile',
      label: 'Hồ sơ cá nhân',
      icon: <UserCheck className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-800 bg-slate-900/60 backdrop-blur-md min-h-[calc(100vh-4rem)]">
      {/* Navigation items */}
      <div className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu Điều Hướng
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* DevOps & Monitoring Tools Section */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase flex items-center justify-between">
          <span>Hạ Tầng Giám Sát</span>
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
        </div>
        <div className="space-y-1 text-xs">
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Grafana Dashboard
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">3001</span>
          </a>

          <a
            href="http://localhost:9090"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              Prometheus UI
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">9090</span>
          </a>

          <a
            href="http://localhost:5050"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              pgAdmin 4
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">5050</span>
          </a>

          <a
            href="/api/health"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Health Check API
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">UP</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
