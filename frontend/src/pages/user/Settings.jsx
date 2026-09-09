import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Moon, Sun, Bell, BellOff, Volume2, VolumeX,
  Lock, Shield, Smartphone, FileText, Settings as SettingsIcon,
  Globe, DollarSign, LogOut, User, Check, ChevronRight,
  Eye, EyeOff, Save, X, AlertTriangle, Copy, RefreshCw,
  Languages, Monitor, Clock, Key, Trash2, Download,
  Mail, Phone, UserCircle, Award, Zap
} from 'lucide-react';
import { logout, updateSettings, getSettings } from '../../store/slices/authSlice';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { language, changeLanguage, translate } = useLanguage();
  const { theme, changeTheme } = useTheme();
  
  const t = translate;
  
  const [loading, setLoading] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [currency, setCurrency] = useState('NPR');
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  
  // Password Change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 2FA
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  
  // Sessions
  const [sessions, setSessions] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  
  // Data Export
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState('all');
  
  // Delete Account - Multi-step
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteShowPassword, setDeleteShowPassword] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const savedSound = localStorage.getItem('soundEffects');
    if (savedSound === 'false') setSoundEffects(false);
    
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) setCurrency(savedCurrency);
    
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications === 'false') setNotifications(false);
    
    // Fetch sessions
    fetchSessions();
    fetch2FAStatus();
    fetchSettings();
  }, []);

  // ===== FETCH FUNCTIONS =====
  const fetchSessions = async () => {
    setSessionLoading(true);
    try {
      const response = await axios.get('/api/users/sessions');
      const sessionsData = response.data?.data || [];
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions([]);
    } finally {
      setSessionLoading(false);
    }
  };

  const fetch2FAStatus = async () => {
    try {
      const response = await axios.get('/api/users/2fa/status');
      setTwoFAEnabled(response.data?.enabled || false);
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
      setTwoFAEnabled(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/users/settings');
      const settings = response.data?.data || {};
      if (settings.currency) setCurrency(settings.currency);
      if (settings.notifications !== undefined) setNotifications(settings.notifications);
      if (settings.soundEffects !== undefined) setSoundEffects(settings.soundEffects);
      if (settings.emailNotifications !== undefined) setEmailNotifications(settings.emailNotifications);
      if (settings.pushNotifications !== undefined) setPushNotifications(settings.pushNotifications);
      if (settings.transactionAlerts !== undefined) setTransactionAlerts(settings.transactionAlerts);
      if (settings.loginAlerts !== undefined) setLoginAlerts(settings.loginAlerts);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  // ===== SETTINGS FUNCTIONS =====
  const updateSetting = async (key, value) => {
    try {
      await dispatch(updateSettings({ [key]: value })).unwrap();
      return true;
    } catch (error) {
      toast.error(t('somethingWentWrong'));
      return false;
    }
  };

  // ===== DARK MODE =====
  const toggleDarkMode = () => {
    changeTheme(theme === 'dark' ? 'light' : 'dark');
    toast.success(theme === 'dark' ? 'Light mode enabled' : 'Dark mode enabled');
  };

  // ===== NOTIFICATIONS =====
  const toggleNotifications = async () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications', String(newValue));
    await updateSetting('notifications', newValue);
    toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled');
  };

  const togglePushNotifications = async () => {
    const newValue = !pushNotifications;
    setPushNotifications(newValue);
    await updateSetting('pushNotifications', newValue);
    toast.success(newValue ? 'Push notifications enabled' : 'Push notifications disabled');
  };

  const toggleEmailNotifications = async () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    await updateSetting('emailNotifications', newValue);
    toast.success(newValue ? 'Email notifications enabled' : 'Email notifications disabled');
  };

  // ===== SOUND EFFECTS =====
  const toggleSoundEffects = () => {
    const newValue = !soundEffects;
    setSoundEffects(newValue);
    localStorage.setItem('soundEffects', String(newValue));
    toast.success(newValue ? 'Sound effects enabled' : 'Sound effects disabled');
  };

  // ===== LANGUAGE =====
  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    toast.success(`Language changed to ${lang === 'ne' ? 'Nepali' : 'English'}`);
  };

  // ===== CURRENCY =====
  const handleCurrencyChange = async (curr) => {
    setCurrency(curr);
    localStorage.setItem('currency', curr);
    await updateSetting('currency', curr);
    toast.success(`Currency changed to ${curr}`);
  };

  // ===== CHANGE PASSWORD =====
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('passwordsDontMatch'));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error(t('passwordMinLength'));
      return;
    }
    
    setPasswordLoading(true);
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success(t('passwordChanged'));
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || t('somethingWentWrong'));
    } finally {
      setPasswordLoading(false);
    }
  };

  // ===== 2FA =====
  const handle2FASetup = async () => {
    setTwoFALoading(true);
    try {
      const response = await axios.post('/api/users/2fa/setup');
      setTwoFASecret(response.data.data?.secret || '');
      setBackupCodes(response.data.data?.backupCodes || []);
      toast.success('2FA setup initiated');
    } catch (error) {
      toast.error('Failed to setup 2FA');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FAVerify = async () => {
    if (twoFACode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    setTwoFALoading(true);
    try {
      await axios.post('/api/users/2fa/verify', { code: twoFACode });
      setTwoFAEnabled(true);
      toast.success(t('twoFAEnabled'));
      setShow2FAModal(false);
      setTwoFACode('');
    } catch (error) {
      toast.error('Invalid 2FA code');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FADisable = async () => {
    if (!confirm('Are you sure you want to disable 2FA?')) return;
    try {
      await axios.post('/api/users/2fa/disable');
      setTwoFAEnabled(false);
      toast.success(t('twoFADisabled'));
    } catch (error) {
      toast.error('Failed to disable 2FA');
    }
  };

  // ===== SESSIONS =====
  const handleLogoutAllDevices = async () => {
    if (!confirm('Logout from all devices? You will be logged out from this device too.')) return;
    try {
      await axios.post('/api/users/sessions/logout-all');
      toast.success(t('allDevicesLoggedOut'));
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout from all devices');
    }
  };

  const handleLogoutDevice = async (sessionId) => {
    try {
      await axios.delete(`/api/users/sessions/${sessionId}`);
      toast.success(t('sessionLoggedOut'));
      fetchSessions();
    } catch (error) {
      toast.error('Failed to logout device');
    }
  };

  // ===== DATA EXPORT =====
  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const response = await axios.post('/api/users/export', { type: exportType }, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sajilosplit-data-${new Date().toISOString()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Data exported successfully!');
      setShowExportModal(false);
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  // ===== DELETE ACCOUNT - Multi-step =====
  const handleDeleteStep1 = () => {
    setDeleteStep(2);
  };

  const handleDeleteStep2 = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }
    setDeleteStep(3);
  };

  const handleDeleteStep3 = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    
    setDeleteLoading(true);
    try {
      await axios.delete('/api/users/account', {
        data: { password: deletePassword }
      });
      toast.success(t('accountDeleted'));
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || t('accountDeleteFailed'));
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setDeleteStep(1);
      setDeleteConfirm('');
      setDeletePassword('');
    }
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setDeleteStep(1);
    setDeleteConfirm('');
    setDeletePassword('');
  };

  // ===== LOGOUT =====
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Settings Sections
  const settingsSections = [
    {
      title: t('preferences'),
      icon: SettingsIcon,
      items: [
        { 
          id: 'darkMode', 
          label: t('darkMode'), 
          type: 'toggle', 
          value: theme === 'dark', 
          onChange: toggleDarkMode,
          icon: theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />
        },
        { 
          id: 'language', 
          label: t('language'), 
          type: 'select', 
          options: [
            { value: 'en', label: 'English' },
            { value: 'ne', label: 'नेपाली' }
          ], 
          value: language, 
          onChange: handleLanguageChange,
          icon: <Languages className="w-4 h-4" />
        },
        { 
          id: 'currency', 
          label: t('currency'), 
          type: 'select', 
          options: [
            { value: 'NPR', label: 'NPR (Rs.)' },
            { value: 'USD', label: 'USD ($)' },
            { value: 'EUR', label: 'EUR (€)' },
            { value: 'GBP', label: 'GBP (£)' },
            { value: 'INR', label: 'INR (₹)' }
          ], 
          value: currency, 
          onChange: handleCurrencyChange,
          icon: <DollarSign className="w-4 h-4" />
        },
        { 
          id: 'notifications', 
          label: t('pushNotifications'), 
          type: 'toggle', 
          value: notifications, 
          onChange: toggleNotifications,
          icon: notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />
        },
        { 
          id: 'soundEffects', 
          label: t('soundEffects'), 
          type: 'toggle', 
          value: soundEffects, 
          onChange: toggleSoundEffects,
          icon: soundEffects ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />
        },
      ]
    },
    {
      title: t('security'),
      icon: Shield,
      items: [
        { 
          id: 'changePassword', 
          label: t('changePassword'), 
          type: 'button', 
          onClick: () => setShowPasswordModal(true),
          icon: <Lock className="w-4 h-4" />
        },
        { 
          id: 'twoFactor', 
          label: t('twoFactorAuth'), 
          type: 'button', 
          onClick: twoFAEnabled ? handle2FADisable : () => {
            setShow2FAModal(true);
            handle2FASetup();
          },
          icon: <Shield className="w-4 h-4" />,
          badge: twoFAEnabled ? 'Enabled' : 'Disabled',
          badgeColor: twoFAEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
        },
        { 
          id: 'sessions', 
          label: t('sessionManagement'), 
          type: 'button', 
          onClick: () => document.getElementById('sessionsSection')?.scrollIntoView({ behavior: 'smooth' }),
          icon: <Smartphone className="w-4 h-4" />
        },
        { 
          id: 'loginAlerts', 
          label: 'Login Alerts', 
          type: 'toggle', 
          value: loginAlerts, 
          onChange: async () => {
            const newValue = !loginAlerts;
            setLoginAlerts(newValue);
            await updateSetting('loginAlerts', newValue);
            toast.success(newValue ? 'Login alerts enabled' : 'Login alerts disabled');
          },
          icon: <Bell className="w-4 h-4" />
        },
        { 
          id: 'transactionAlerts', 
          label: 'Transaction Alerts', 
          type: 'toggle', 
          value: transactionAlerts, 
          onChange: async () => {
            const newValue = !transactionAlerts;
            setTransactionAlerts(newValue);
            await updateSetting('transactionAlerts', newValue);
            toast.success(newValue ? 'Transaction alerts enabled' : 'Transaction alerts disabled');
          },
          icon: <Bell className="w-4 h-4" />
        },
      ]
    },
    {
      title: t('privacy'),
      icon: FileText,
      items: [
        { 
          id: 'privacyPolicy', 
          label: t('privacyPolicy'), 
          type: 'link', 
          href: '/privacy',
          icon: <FileText className="w-4 h-4" />
        },
        { 
          id: 'termsOfService', 
          label: t('termsOfService'), 
          type: 'link', 
          href: '/terms',
          icon: <FileText className="w-4 h-4" />
        },
        { 
          id: 'dataExport', 
          label: t('dataExport'), 
          type: 'button', 
          onClick: () => setShowExportModal(true),
          icon: <Download className="w-4 h-4" />
        },
        { 
          id: 'emailNotifications', 
          label: 'Email Notifications', 
          type: 'toggle', 
          value: emailNotifications, 
          onChange: toggleEmailNotifications,
          icon: <Mail className="w-4 h-4" />
        },
        { 
          id: 'pushNotifications', 
          label: 'Push Notifications', 
          type: 'toggle', 
          value: pushNotifications, 
          onChange: togglePushNotifications,
          icon: <Bell className="w-4 h-4" />
        },
      ]
    },
    {
      title: t('account'),
      icon: Globe,
      items: [
        { 
          id: 'profile', 
          label: t('profile'), 
          type: 'link', 
          href: '/profile',
          icon: <User className="w-4 h-4" />
        },
        { 
          id: 'deleteAccount', 
          label: t('deleteAccount'), 
          type: 'button', 
          onClick: () => setShowDeleteModal(true),
          icon: <Trash2 className="w-4 h-4" />,
          danger: true
        },
        { 
          id: 'logout', 
          label: t('logout'), 
          type: 'button', 
          onClick: handleLogout,
          icon: <LogOut className="w-4 h-4" />,
          danger: true
        },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage your app preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Profile */}
        <div className="lg:col-span-1">
          <div className="card-premium">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#0EA5A5]/30">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-bold">{user?.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
              </div>
            </div>
            
            <div className="border-t border-[var(--border)] pt-4 space-y-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--surface-hover)] transition">
                <User className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Edit Profile</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 transition text-red-500"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-4">
          {settingsSections.map((section) => (
            <div key={section.title} className="card-premium overflow-hidden">
              <div className="p-5 border-b border-[var(--border-light)] flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#0EA5A5]/10 text-[#0EA5A5]">
                  <section.icon className="w-4 h-4" />
                </div>
                <h2 className="font-semibold">{section.title}</h2>
              </div>
              <div className="divide-y divide-[var(--border-light)]">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-[var(--surface-hover)] transition">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-[var(--surface)] text-[var(--text-muted)]">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                      
                      {item.type === 'toggle' && (
                        <button
                          onClick={item.onChange}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            item.value ? 'bg-[#0EA5A5]' : 'bg-[var(--border)]'
                          }`}
                        >
                          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            item.value ? 'translate-x-5' : ''
                          }`} />
                        </button>
                      )}
                      
                      {item.type === 'button' && (
                        <button
                          onClick={item.onClick}
                          className={`text-sm font-medium ${
                            item.danger ? 'text-red-500 hover:text-red-600' : 'text-[#0EA5A5] hover:text-[#0B8A8A]'
                          } transition`}
                        >
                          {item.danger ? item.label : <ChevronRight className="w-4 h-4" />}
                        </button>
                      )}
                      
                      {item.type === 'link' && (
                        <a
                          href={item.href}
                          className="text-[#0EA5A5] hover:text-[#0B8A8A] transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </a>
                      )}
                      
                      {item.type === 'select' && (
                        <select
                          value={item.value}
                          onChange={(e) => item.onChange(e.target.value)}
                          className="border rounded-xl px-3 py-1.5 text-sm bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
                        >
                          {item.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SESSIONS SECTION ===== */}
      <div id="sessionsSection" className="card-premium">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#0EA5A5]" />
            <h2 className="font-semibold">{t('activeSessions')}</h2>
          </div>
          <button 
            onClick={handleLogoutAllDevices}
            className="text-sm text-red-500 hover:text-red-600 font-medium transition"
          >
            {t('logoutAll')}
          </button>
        </div>
        
        {sessionLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0EA5A5]/20 border-t-[#0EA5A5] mx-auto"></div>
          </div>
        ) : sessions?.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <Smartphone className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
            <p className="text-sm">{t('noSessions')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id || session._id} className="flex items-center justify-between p-3 bg-[var(--surface)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-[#0EA5A5]/10 text-[#0EA5A5]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{session.deviceName || 'Unknown Device'}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {session.ip || 'Unknown IP'} • Last active: {session.lastActive ? new Date(session.lastActive).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  {session.isCurrent && (
                    <span className="text-[10px] font-bold uppercase bg-[#0EA5A5]/10 text-[#0EA5A5] px-2 py-0.5 rounded-full">
                      {t('current')}
                    </span>
                  )}
                </div>
                {!session.isCurrent && (
                  <button 
                    onClick={() => handleLogoutDevice(session.id || session._id)}
                    className="text-[var(--text-muted)] hover:text-red-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== CHANGE PASSWORD MODAL ===== */}
      {showPasswordModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold">{t('changePassword')}</h2>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-[var(--surface-hover)] rounded-xl transition">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">{t('currentPassword')}</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">{t('newPassword')}</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter new password (min 6 chars)"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1.5">{t('confirmPassword')}</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white py-3.5 rounded-xl font-semibold hover:shadow-[0_20px_60px_-15px_rgba(14,165,165,0.4)] transition disabled:opacity-50"
              >
                {passwordLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Updating...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== 2FA MODAL ===== */}
      {show2FAModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold">{t('twoFactorAuth')}</h2>
              </div>
              <button onClick={() => setShow2FAModal(false)} className="p-2 hover:bg-[var(--surface-hover)] rounded-xl transition">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            {twoFASecret ? (
              <div className="space-y-4">
                <div className="p-4 bg-[var(--surface)] rounded-xl text-center">
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Scan this QR code with Google Authenticator</p>
                  <div className="w-40 h-40 bg-white mx-auto rounded-xl border-2 border-dashed border-[var(--border)] flex items-center justify-center">
                    <div className="text-6xl">📱</div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-[var(--text-muted)]">Or enter this key manually:</p>
                    <code className="text-sm font-mono bg-[var(--surface)] px-3 py-1 rounded-lg block mt-1">
                      {twoFASecret}
                    </code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(twoFASecret);
                        toast.success('Secret key copied!');
                      }}
                      className="text-xs text-[#0EA5A5] mt-1 hover:underline"
                    >
                      Copy key
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('enter2FACode')}</label>
                  <input
                    type="text"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field text-center text-2xl font-bold tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                  />
                </div>

                {backupCodes.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-900/20 dark:border-amber-800">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-400">{t('backupCodes')}</p>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {backupCodes.map((code, i) => (
                        <code key={i} className="text-xs font-mono bg-white px-2 py-1 rounded text-center dark:bg-gray-800 dark:text-white">
                          {code}
                        </code>
                      ))}
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-2">{t('saveBackupCodes')}</p>
                  </div>
                )}

                <button
                  onClick={handle2FAVerify}
                  disabled={twoFALoading}
                  className="w-full bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {twoFALoading ? 'Verifying...' : 'Enable 2FA'}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-16 h-16 text-[#0EA5A5] mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Setup 2FA</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2">Add an extra layer of security to your account</p>
                <button
                  onClick={handle2FASetup}
                  className="mt-4 bg-[#0EA5A5] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#0B8A8A] transition"
                >
                  Start Setup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== DATA EXPORT MODAL ===== */}
      {showExportModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold">{t('dataExport')}</h2>
              </div>
              <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-[var(--surface-hover)] rounded-xl transition">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">Download all your data in a ZIP file.</p>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Export Type</label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Data</option>
                  <option value="transactions">Transactions Only</option>
                  <option value="profile">Profile Data</option>
                  <option value="groups">Groups & Expenses</option>
                </select>
              </div>

              <button
                onClick={handleExportData}
                disabled={exportLoading}
                className="w-full bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-50"
              >
                {exportLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Exporting...
                  </span>
                ) : (
                  'Export Data'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE ACCOUNT MODAL - Multi-step ===== */}
      {showDeleteModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-xl font-bold">{t('deleteAccount')}</h2>
              </div>
              <button onClick={handleDeleteClose} className="p-2 hover:bg-[var(--surface-hover)] rounded-xl transition">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Step 1: Warning */}
            {deleteStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-sm text-red-800 font-medium dark:text-red-400">⚠️ {t('deleteAccountWarning')}</p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">{t('deleteAccountData')}</p>
                  <ul className="text-sm text-red-600 dark:text-red-300 mt-2 space-y-1">
                    <li>• {t('deleteAccountList').split('\n').map(item => item.replace('• ', '')).join('\n• ')}</li>
                  </ul>
                </div>
                <button
                  onClick={handleDeleteStep1}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-[0_20px_60px_-15px_rgba(239,68,68,0.4)] transition"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Password Verification */}
            {deleteStep === 2 && (
              <form onSubmit={handleDeleteStep2} className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)]">Please enter your password to verify your identity.</p>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={deleteShowPassword ? 'text' : 'password'}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="input-field"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setDeleteShowPassword(!deleteShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                    >
                      {deleteShowPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    className="flex-1 border-2 border-[var(--border)] text-[var(--text-secondary)] py-3 rounded-xl font-semibold hover:bg-[var(--surface-hover)] transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:shadow-[0_20px_60px_-15px_rgba(239,68,68,0.4)] transition"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Final Confirmation */}
            {deleteStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-sm text-red-800 font-medium dark:text-red-400">{t('deleteAccountFinal')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('deleteAccountConfirm')}</label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="input-field"
                    placeholder="Type DELETE"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    className="flex-1 border-2 border-[var(--border)] text-[var(--text-secondary)] py-3 rounded-xl font-semibold hover:bg-[var(--surface-hover)] transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDeleteStep3}
                    disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:shadow-[0_20px_60px_-15px_rgba(239,68,68,0.4)] transition disabled:opacity-50"
                  >
                    {deleteLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Deleting...
                      </span>
                    ) : (
                      'Permanently Delete'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;