import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Menu, X, Bell, User, LogOut, Home, Wallet, Users, 
  PieChart, Calendar, Lock, Shield, Settings, FileText, 
  CreditCard, ChevronRight, ShieldCheck
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useSocket } from '../hooks/useSocket';
import { useLanguage } from '../context/LanguageContext';

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const socket = useSocket();
  const { t } = useLanguage();

  // Get KYC status
  const kycStatus = user?.kyc?.status || 'not_submitted';
  const isKYCApproved = kycStatus === 'approved';

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
        bg-white/95 dark:bg-slate-900 backdrop-blur-xl 
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
                    Fintech Nepal
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
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || 'user@email.com'}
                </p>
              </div>
              {/* KYC Status Indicator */}
              <div className={`w-2 h-2 rounded-full ${
                isKYCApproved ? 'bg-emerald-500' : 'bg-amber-500'
              } shadow-lg`}></div>
            </div>
            
            {/* KYC Warning */}
            {!isKYCApproved && (
              <button
                onClick={() => navigate('/kyc')}
                className="w-full mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex-1 text-left">
                  {kycStatus === 'pending' ? 'KYC Under Review' : 
                   kycStatus === 'rejected' ? 'KYC Rejected' : 
                   'Verify KYC'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
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

            {/* KYC Menu Item */}
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  navigate('/kyc');
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium 
                  transition-all duration-200
                  ${isActive('/kyc')
                    ? 'bg-[#0EA5A5]/10 text-[#0EA5A5] border-r-4 border-[#0EA5A5] font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <ShieldCheck className={`w-5 h-5 ${isActive('/kyc') ? 'text-[#0EA5A5]' : 'text-slate-400'}`} />
                <span>KYC Verification</span>
                {isKYCApproved && (
                  <span className="ml-auto text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
                {!isKYCApproved && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    kycStatus === 'pending' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {kycStatus === 'pending' ? 'Pending' : 'Required'}
                  </span>
                )}
              </button>
            </div>
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <button
              onClick={() => { navigate('/settings'); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
            >
              <Settings className="w-5 h-5 text-slate-400" />
              <span>{t('settings') || 'Settings'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('logout') || 'Logout'}</span>
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
            <h1 className="text-base font-bold text-[#0EA5A5]">SajiloSplit</h1>
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
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white text-xs font-bold"
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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

export default UserLayout;