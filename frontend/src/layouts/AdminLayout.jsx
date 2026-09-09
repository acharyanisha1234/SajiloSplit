import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Menu, X, LayoutDashboard, Users, Receipt, Users as GroupIcon, 
  AlertTriangle, Tag, FileText, LogOut, Bell, Settings,
  Shield
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Receipt, label: 'Transactions', path: '/admin/transactions' },
    { icon: GroupIcon, label: 'Groups', path: '/admin/groups' },
    { icon: AlertTriangle, label: 'Disputes', path: '/admin/disputes' },
    { icon: Tag, label: 'Categories', path: '/admin/categories' },
    { icon: FileText, label: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      {/* Mobile Nav */}
      <nav className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <h1 className="text-lg font-bold text-[#0EA5A5]">Admin</h1>
        </div>
        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </nav>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-sm
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center shadow-lg shadow-[#0EA5A5]/30">
                    <span className="text-white font-bold text-base">S</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-[#0EA5A5]">SajiloSplit</h1>
                    <p className="text-[10px] text-slate-500 tracking-wider uppercase">Administration</p>
                  </div>
                </div>
              </div>
              <button className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Admin Badge */}
          <div className="mx-4 mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0EA5A5]/20 to-[#0B8A8A]/10 border border-[#0EA5A5]/20 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0EA5A5]" />
            <span className="text-xs font-medium text-slate-300">Administrator Access</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#0EA5A5] text-white shadow-lg shadow-[#0EA5A5]/30' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-lg shadow-white/50"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-slate-800 space-y-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Switch to User</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;