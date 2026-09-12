import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Menu, X, Bell, User, LogOut, Home, Wallet, Users, 
  PieChart, Calendar, Lock, Shield, Settings, FileText, 
  CreditCard, ChevronRight, Sparkles
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useSocket } from '../hooks/useSocket';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, ShieldCheck } from 'lucide-react';

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const socket = useSocket();
  
  const { t } = useLanguage();
  const { isDark } = useTheme();

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
    { icon: Home, label: t('dashboard') || 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: t('wallet') || 'Wallet', path: '/wallet' },
    { icon: Users, label: t('groups') || 'Groups', path: '/groups' },
    { icon: PieChart, label: t('budgets') || 'Budgets', path: '/budgets' },
    { icon: Calendar, label: t('bills') || 'Bills', path: '/bills' },
    { icon: Lock, label: t('lockedFunds') || 'Locked Funds', path: '/locked-funds' },
    { icon: Shield, label: t('emergencyFunds') || 'Emergency Funds', path: '/emergency-funds' },
    { icon: FileText, label: t('settlements') || 'Settlements', path: '/settlements' },
    { icon: ShieldCheck, label: 'KYC Verification', path: '/kyc' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex" style={{ 
      backgroundColor: 'var(--background)',
      color: 'var(--text-primary)'
    }}>
      {/* ===== SIDEBAR ===== */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] 
        glass-sidebar
        flex flex-col justify-between p-6 transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0EA5A5] to-[#1A2E4A] flex items-center justify-center shadow-lg shadow-[#0EA5A5]/20">
                <span className="text-white font-bold text-xl font-mono tracking-wider">S</span>
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none tracking-tight text-primary">
                  Sajilo<span className="text-[#0EA5A5]">Split</span>
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#D4A373]">Fintech Nepal</span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-secondary hover:text-primary hover:bg-surface-hover transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-3.5 rounded-2xl bg-[#0EA5A5]/5 border border-[#0EA5A5]/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white flex items-center justify-center font-semibold shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-secondary truncate">{user?.email || 'user@email.com'}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">
              {t('menu') || 'Menu'}
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
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200
                    ${active 
                      ? 'bg-[#0EA5A5]/10 text-[#0EA5A5] border-r-4 border-[#0EA5A5] shadow-sm' 
                      : 'text-secondary hover:bg-surface-hover hover:text-primary'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-[#0EA5A5]' : 'text-muted'}`} />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto text-[#0EA5A5]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="space-y-1 pt-6 border-t border-border">
          <button
            onClick={() => { navigate('/settings'); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-secondary hover:bg-surface-hover hover:text-primary transition duration-200"
          >
            <Settings className="w-5 h-5 text-muted" />
            <span>{t('settings') || 'Settings'}</span>
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => { navigate('/admin/dashboard'); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-secondary hover:bg-surface-hover hover:text-primary transition duration-200"
            >
              <Shield className="w-5 h-5 text-muted" />
              <span>Admin Panel</span>
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition duration-200 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('logout') || 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#1A2E4A]/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default UserLayout;