import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Menu, X, Bell, User, LogOut, Home, Wallet, Users, 
  PieChart, Calendar, Lock, Shield, Settings, FileText 
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useSocket } from '../hooks/useSocket';

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket();

  useEffect(() => {
    if (socket && user) {
      socket.emit('join-user', user.id);
    }
  }, [socket, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: Users, label: 'Groups', path: '/groups' },
    { icon: PieChart, label: 'Budgets', path: '/budgets' },
    { icon: Calendar, label: 'Bills', path: '/bills' },
    { icon: Lock, label: 'Locked Funds', path: '/locked-funds' },
    { icon: Shield, label: 'Emergency Funds', path: '/emergency-funds' },
    { icon: FileText, label: 'Settlements', path: '/settlements' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Nav */}
      <nav className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-primary-600">SajiloSplit</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/notifications')} className="relative">
            <Bell className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button onClick={() => navigate('/profile')}>
            <User className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-sm
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary-600">SajiloSplit</h1>
                <p className="text-sm text-gray-500">Smart Money Management</p>
              </div>
              <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t space-y-2">
            <button
              onClick={() => {
                navigate('/settings');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      <main className="lg:ml-64 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;