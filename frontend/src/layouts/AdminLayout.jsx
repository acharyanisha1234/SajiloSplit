import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Menu, X, LayoutDashboard, Users, Receipt, Users as GroupIcon, 
  AlertTriangle, Tag, FileText, LogOut, Bell
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
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Nav */}
      <nav className="lg:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-gray-800">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-primary-400">Admin Panel</h1>
        <button>
          <Bell className="w-6 h-6" />
        </button>
      </nav>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 border-r border-gray-800
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-sm
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary-400">SajiloSplit</h1>
                <p className="text-sm text-gray-400">Admin Panel</p>
              </div>
              <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;