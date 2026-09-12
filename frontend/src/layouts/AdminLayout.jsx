import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Menu, X, LayoutDashboard, Users, Receipt, FolderKanban, 
  AlertTriangle, Tag, FileText, LogOut, Bell, Settings,
  ShieldCheck, Command, Search, ChevronRight, UserCheck, 
  ArrowLeftRight, Sparkles, Activity, Home
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth || {});
  const { unreadCount } = useSelector((state) => state.notifications || {});

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Command palette shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  //  GROUPED NAVIGATION
  const navSections = [
    {
      groupLabel: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      ]
    },
    {
      groupLabel: 'Financial & Users',
      items: [
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Receipt, label: 'Transactions', path: '/admin/transactions' },
        { icon: FolderKanban, label: 'Groups', path: '/admin/groups' },
      ]
    },
    {
      groupLabel: 'Governance',
      items: [
        { icon: AlertTriangle, label: 'Disputes', path: '/admin/disputes', badge: '3' },
        { icon: Tag, label: 'Categories', path: '/admin/categories' },
        { icon: FileText, label: 'Audit Logs', path: '/admin/audit-logs' },
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  // BREADCRUMB RESOLVER 
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/transactions')) return 'Transaction Ledger';
    if (path.includes('/groups')) return 'Group Operations';
    if (path.includes('/disputes')) return 'Dispute Resolution';
    if (path.includes('/categories')) return 'System Categories';
    if (path.includes('/audit-logs')) return 'Audit & Security';
    return 'Admin Console';
  };

  return (
    <div className="min-h-screen flex bg-[#F8F6F0] dark:bg-[#0F1724]">
      
      {/*MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/*  SIDEBAR  */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px]
        bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950
        flex-shrink-0 flex flex-col
        border-r border-slate-800/40
        transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5A5]/5 via-transparent to-[#D4A373]/5 pointer-events-none"></div>

        <div className="relative h-full flex flex-col">
          
          {/*  LOGO HEADER */}
          <div className="px-5 py-5 border-b border-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center shadow-lg shadow-[#0EA5A5]/30">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-base font-bold text-white leading-tight">
                    SajiloSplit
                  </h1>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-[#0EA5A5]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0EA5A5]">
                      Admin Panel
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/*ADMIN PROFILE CARD */}
          <div className="px-4 py-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#0EA5A5]/10 to-[#D4A373]/5 border border-[#0EA5A5]/20">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#0EA5A5]/25">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'admin@sajilosplit.com'}
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
            </div>
          </div>

          {/* GROUPED NAVIGATION*/}
          <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
            {navSections.map((section) => (
              <div key={section.groupLabel} className="mb-5 last:mb-0">
                <div className="flex items-center gap-2 px-3 mb-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-700/50 to-transparent"></div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    {section.groupLabel}
                  </p>
                  <div className="flex-1 h-px bg-gradient-to-l from-slate-700/50 to-transparent"></div>
                </div>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`
                          group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
                          text-sm font-medium transition-all duration-200
                          ${active
                            ? 'bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white shadow-lg shadow-[#0EA5A5]/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}
                        `}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-[#0EA5A5]'} transition-colors`} />
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        
                        {item.badge && !active && (
                          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        
                        {active && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-lg shadow-white/50"></div>
                        )}
                        
                        {!active && !item.badge && (
                          <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/*BOTTOM ACTIONS */}
          <div className="px-3 py-3 border-t border-slate-800/50 space-y-1">
            
            {/* Switch to User */}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all group"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-slate-500 group-hover:text-[#D4A373] transition-colors" />
              </div>
              <span className="flex-1 text-left">Switch to User</span>
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Settings */}
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all group"
            >
              <Settings className="w-5 h-5 text-slate-500 group-hover:text-[#0EA5A5] transition-colors" />
              <span className="flex-1 text-left">Settings</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="flex-1 text-left">Logout</span>
            </button>
          </div>

          {/*  SYSTEM STATUS FOOTER*/}
          <div className="px-5 py-3 border-t border-slate-800/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-600 font-mono">v1.0.0</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] text-slate-500">Operational</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-slate-600" />
              <span className="text-[10px] text-slate-600">All systems online</span>
            </div>
          </div>
        </div>
      </aside>

      {/*  MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/*  DESKTOP TOP BAR */}
        <header className="hidden lg:flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-8 py-3.5 items-center justify-between sticky top-0 z-30">
          
          {/* Breadcrumb + Search */}
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <Home className="w-4 h-4 text-slate-400" />
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-500">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {getBreadcrumb()}
              </span>
            </div>

            {/* Search - Desktop */}
            <div className={`relative flex-1 max-w-md transition-all ${searchFocused ? 'ring-2 ring-[#0EA5A5]/20' : ''} rounded-xl`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search anything..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-20 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#0EA5A5] transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono text-slate-500">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            
            {/* Admin Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#0EA5A5]/10 to-[#D4A373]/10 border border-[#0EA5A5]/20">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0EA5A5]" />
              <span className="text-xs font-semibold text-[#0EA5A5]">
                Administrator
              </span>
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {(unreadCount > 0 || 3) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {/* Settings */}
            <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* Avatar */}
            <button className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#0EA5A5]/25 hover:scale-105 transition-transform">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </button>
          </div>
        </header>

        {/* MOBILE HEADER */}
        <header className="lg:hidden bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-800/60 rounded-lg transition"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center shadow-lg shadow-[#0EA5A5]/30">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">SajiloSplit</h1>
              <span className="text-[9px] text-[#0EA5A5] font-semibold tracking-wider">ADMIN</span>
            </div>
          </div>
          
          <button className="relative p-2 hover:bg-slate-800/60 rounded-lg transition">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900"></span>
          </button>
        </header>

        {/*  PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* COMMAND PALETTE (Optional)*/}
      {commandOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-24 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search pages, users, transactions..."
                className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none text-sm"
                autoFocus
              />
              <button
                onClick={() => setCommandOpen(false)}
                className="text-xs text-slate-400 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded"
              >
                ESC
              </button>
            </div>
            <div className="p-3 max-h-80 overflow-y-auto">
              {navSections.flatMap(s => s.items).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setCommandOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;