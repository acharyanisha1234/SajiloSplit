import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Theme configuration
const THEMES = {
  light: {
    id: 'light',
    name: 'Light',
    icon: '',
    // CSS Variables
    background: '#F8F6F0',
    surface: '#FFFFFF',
    surfaceHover: '#F1EFEB',
    textPrimary: '#1A2E4A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderDark: '#CBD5E1',
    cardBg: '#FFFFFF',
    cardShadow: '0 20px 60px -15px rgba(26, 46, 74, 0.08)',
    cardShadowHover: '0 25px 70px -15px rgba(26, 46, 74, 0.15)',
    inputBg: '#FDF6F0/50',
    inputBorder: '#E2E8F0',
    inputFocus: '#0EA5A5',
    inputFocusRing: 'rgba(14, 165, 165, 0.2)',
    sidebarBg: 'rgba(255, 255, 255, 0.8)',
    sidebarBorder: 'rgba(14, 165, 165, 0.1)',
    glassBg: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(226, 232, 240, 0.5)',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    modalBg: '#FFFFFF',
    scrollbarTrack: '#F1F5F9',
    scrollbarThumb: '#0EA5A5',
    badgeBg: '#F1F5F9',
    badgeText: '#475569',
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    icon: '',
    // CSS Variables
    background: '#0F1724',
    surface: '#1A2E4A',
    surfaceHover: '#243B5E',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#0F1724',
    border: '#2D4059',
    borderLight: '#1E334F',
    borderDark: '#3A5570',
    cardBg: '#1A2E4A',
    cardShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.4)',
    cardShadowHover: '0 25px 70px -15px rgba(0, 0, 0, 0.5)',
    inputBg: '#243B5E/50',
    inputBorder: '#2D4059',
    inputFocus: '#0EA5A5',
    inputFocusRing: 'rgba(14, 165, 165, 0.3)',
    sidebarBg: 'rgba(26, 46, 74, 0.95)',
    sidebarBorder: 'rgba(14, 165, 165, 0.15)',
    glassBg: 'rgba(26, 46, 74, 0.8)',
    glassBorder: 'rgba(45, 64, 89, 0.5)',
    modalOverlay: 'rgba(0, 0, 0, 0.8)',
    modalBg: '#1A2E4A',
    scrollbarTrack: '#1E334F',
    scrollbarThumb: '#0EA5A5',
    badgeBg: '#2D4059',
    badgeText: '#94A3B8',
  }
};

// Get saved theme from localStorage or backend
const getSavedTheme = async () => {
  // First check localStorage
  const localTheme = localStorage.getItem('theme');
  if (localTheme) return localTheme;
  
  // If not in localStorage, try to get from backend
  try {
    const response = await axios.get('/api/users/settings');
    if (response.data?.data?.theme) {
      return response.data.data.theme;
    }
  } catch (error) {
    console.log('Could not fetch theme from backend, using default');
  }
  
  return 'light';
};

// Apply theme to DOM
const applyTheme = (themeId) => {
  const theme = THEMES[themeId];
  if (!theme) return;
  
  const root = document.documentElement;
  
  // Apply all CSS variables
  Object.entries(theme).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'name' && key !== 'icon') {
      root.style.setProperty(`--${key}`, value);
    }
  });
  
  // Set data attribute
  root.setAttribute('data-theme', themeId);
  
  // Save to localStorage
  localStorage.setItem('theme', themeId);
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initTheme = async () => {
      const savedTheme = await getSavedTheme();
      setThemeState(savedTheme);
      applyTheme(savedTheme);
      setLoading(false);
    };
    initTheme();
  }, []);

  const changeTheme = async (newTheme) => {
    if (!THEMES[newTheme]) return;
    
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    // Save to backend
    try {
      await axios.put('/api/users/settings', { theme: newTheme });
    } catch (error) {
      console.log('Could not save theme to backend');
    }
    
    // Dispatch custom event for components
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        changeTheme, 
        toggleTheme,
        themes: THEMES,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        loading
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;