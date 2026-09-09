import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Lock, Shield, Moon, Globe, Volume2, User, LogOut, ChevronRight } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const settingsSections = [
    {
      title: 'Preferences',
      icon: User,
      items: [
        { label: 'Dark Mode', type: 'toggle', value: darkMode, onChange: setDarkMode },
        { label: 'Push Notifications', type: 'toggle', value: notifications, onChange: setNotifications },
        { label: 'Sound Effects', type: 'toggle', value: sound, onChange: setSound },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'Change Password', type: 'button', onClick: handleChangePassword },
        { label: 'Two-Factor Authentication', type: 'button', onClick: () => toast.info('Coming soon!') },
        { label: 'Session Management', type: 'button', onClick: () => toast.info('Coming soon!') },
      ]
    },
    {
      title: 'Privacy',
      icon: Lock,
      items: [
        { label: 'Privacy Policy', type: 'link', href: '/privacy' },
        { label: 'Terms of Service', type: 'link', href: '/terms' },
        { label: 'Data Export', type: 'button', onClick: () => toast.success('Data export initiated!') },
      ]
    },
    {
      title: 'Account',
      icon: Globe,
      items: [
        { label: 'Language', type: 'select', options: ['English', 'Nepali', 'Hindi'], value: 'English' },
        { label: 'Currency', type: 'select', options: ['NPR', 'USD', 'EUR'], value: 'NPR' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your app preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 dashboard-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-4">
          {settingsSections.map((section) => (
            <div key={section.title} className="dashboard-card">
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-gray-700">{item.label}</span>
                    {item.type === 'toggle' && (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.value}
                          onChange={(e) => item.onChange(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    )}
                    {item.type === 'button' && (
                      <button
                        onClick={item.onClick}
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    {item.type === 'link' && (
                      <a
                        href={item.href}
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    )}
                    {item.type === 'select' && (
                      <select
                        className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={item.value}
                        onChange={(e) => console.log(e.target.value)}
                      >
                        {item.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;