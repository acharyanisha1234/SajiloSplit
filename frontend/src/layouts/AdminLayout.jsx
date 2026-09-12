import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Menu, X, LayoutDashboard, Users, Receipt, FolderKanban, 
  AlertTriangle, Tag, FileText, LogOut, Bell, Settings,
  ShieldCheck, Search, ChevronRight, Home
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useSocket } from '../hooks/useSocket';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const socket = useSocket();

  const { user } = useSelector((state) => state.auth || {});
  const { unreadCount } = useSelector((state) => state.notifications || {});

  useEffect(() => {
    if (socket && user) {
      socket.emit('join-user', user.id);
    }
  }, [socket, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSwitchToUser = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Receipt, label: 'Transactions', path: '/admin/transactions' },
    { icon: FolderKanban, label: 'Groups', path: '/admin/groups' },
    { icon: AlertTriangle, label: 'Disputes', path: '/admin/disputes' },
    { icon: Tag, label: 'Categories', path: '/admin/categories' },
    { icon: FileText, label: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F8F6F0] dark:bg-[#0F1724] flex">
      
      {/* ===== MOBILE OVERLAY ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] 
        bg-white/80 dark:bg-slate-900 backdrop-blur-xl 
        border-r border-slate-200 dark:border-slate-800
        flex-shrink-0 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5A5] to-[#1A2E4A] flex items-center justify-center shadow-lg shadow-[#0EA5A5]/25">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h1 className="font-bold text-base leading-none text-slate-800 dark:text-white">
                    Sajilo<span className="text-[#0EA5A5]">Split</span>
                  </h1>
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-[#D4A373]">
                    Admin Panel
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#0EA5A5]/10 to-[#D4A373]/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white font-bold text-base shadow-lg shadow-[#0EA5A5]/30">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || 'admin@sajilosplit.com'}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium 
                    transition-all duration-200
                    ${active
                      ? 'bg-[#0EA5A5]/10 text-[#0EA5A5] border-r-4 border-[#0EA5A5] font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-[#0EA5A5]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto text-[#0EA5A5]" />}
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <button
              onClick={handleSwitchToUser}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
            >
              <Home className="w-5 h-5 text-slate-400" />
              <span>Switch to User</span>
            </button>
            <button
              onClick={() => { navigate('/settings'); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
            >
              <Settings className="w-5 h-5 text-slate-400" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <h1 className="text-base font-bold text-[#0EA5A5]">Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;