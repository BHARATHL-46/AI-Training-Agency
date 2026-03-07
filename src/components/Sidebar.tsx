import React from 'react';
import { LayoutDashboard, BookOpen, Trophy, BarChart3, User, LogOut, PlusCircle, Settings, FileUp, ListOrdered, Video } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../lib/api';
import { cn } from '../lib/utils';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const adminItems = [
    { icon: LayoutDashboard, label: 'Admin Dashboard', path: '/admin/dashboard' },
    { icon: BookOpen, label: 'Modules', path: '/admin/modules' },
    { icon: PlusCircle, label: 'Create Module', path: '/admin/create' },
    { icon: Video, label: 'Live Sessions', path: '/admin/live-sessions' },
    { icon: Trophy, label: 'Global Leaderboard', path: '/admin/leaderboard' },
    { icon: BarChart3, label: 'Global Analytics', path: '/admin/analytics' },
  ];

  const studentItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { icon: BookOpen, label: 'My Modules', path: '/student/modules' },
    { icon: Video, label: 'Live Class', path: '/student/live-class' },
    { icon: Trophy, label: 'Leaderboard', path: '/student/leaderboard' },
    { icon: BarChart3, label: 'Analytics', path: '/student/analytics' },
    { icon: User, label: 'Profile', path: '/student/profile' },
  ];

  const navItems = isAdmin ? adminItems : studentItems;

  return (
    <aside className="w-64 h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="text-white" size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            AI Agency
          </span>
        </div>

        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn("transition-transform group-hover:scale-110")} />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{user?.name}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
