// Theme system with CSS variables

export const themes = {
  light: {
    // Backgrounds
    background: '#F8F6F0',
    surface: '#FFFFFF',
    surfaceHover: '#F1EFEB',
    
    // Text
    text: '#1A2E4A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    
    // Borders
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderDark: '#CBD5E1',
    
    // Cards
    cardBg: '#FFFFFF',
    cardShadow: '0 20px 60px -15px rgba(26, 46, 74, 0.08)',
    cardShadowHover: '0 25px 70px -15px rgba(26, 46, 74, 0.15)',
    
    // Inputs
    inputBg: '#FDF6F0/50',
    inputBorder: '#E2E8F0',
    inputFocus: '#0EA5A5',
    inputFocusRing: 'rgba(14, 165, 165, 0.2)',
    
    // Sidebar
    sidebarBg: 'rgba(255, 255, 255, 0.8)',
    sidebarBorder: 'rgba(14, 165, 165, 0.1)',
    
    // Glass
    glassBg: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(226, 232, 240, 0.5)',
    glassBlur: '12px',
    
    // Modal
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    modalBg: '#FFFFFF',
    
    // Scrollbar
    scrollbarTrack: '#F1F5F9',
    scrollbarThumb: '#0EA5A5',
    
    // Shadows
    shadowSm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    shadowMd: '0 4px 6px rgba(0, 0, 0, 0.07)',
    shadowLg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    shadowXl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    shadow2xl: '0 25px 50px rgba(0, 0, 0, 0.15)',
  },
  
  dark: {
    // Backgrounds
    background: '#0F1724',
    surface: '#1A2E4A',
    surfaceHover: '#243B5E',
    
    // Text
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#0F1724',
    
    // Borders
    border: '#2D4059',
    borderLight: '#1E334F',
    borderDark: '#3A5570',
    
    // Cards
    cardBg: '#1A2E4A',
    cardShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.4)',
    cardShadowHover: '0 25px 70px -15px rgba(0, 0, 0, 0.5)',
    
    // Inputs
    inputBg: '#243B5E/50',
    inputBorder: '#2D4059',
    inputFocus: '#0EA5A5',
    inputFocusRing: 'rgba(14, 165, 165, 0.3)',
    
    // Sidebar
    sidebarBg: 'rgba(26, 46, 74, 0.95)',
    sidebarBorder: 'rgba(14, 165, 165, 0.15)',
    
    // Glass
    glassBg: 'rgba(26, 46, 74, 0.8)',
    glassBorder: 'rgba(45, 64, 89, 0.5)',
    glassBlur: '12px',
    
    // Modal
    modalOverlay: 'rgba(0, 0, 0, 0.8)',
    modalBg: '#1A2E4A',
    
    // Scrollbar
    scrollbarTrack: '#1E334F',
    scrollbarThumb: '#0EA5A5',
    
    // Shadows
    shadowSm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    shadowMd: '0 4px 6px rgba(0, 0, 0, 0.4)',
    shadowLg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    shadowXl: '0 20px 25px rgba(0, 0, 0, 0.5)',
    shadow2xl: '0 25px 50px rgba(0, 0, 0, 0.6)',
  }
};

// Get theme
export const getTheme = () => {
  return localStorage.getItem('theme') || 'light';
};

// Set theme
export const setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  applyTheme(theme);
};

// Apply theme to DOM
export const applyTheme = (theme) => {
  const vars = themes[theme];
  if (!vars) return;
  
  const root = document.documentElement;
  
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  
  // Apply dark class for Tailwind
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Get CSS variable
export const getCSSVar = (key) => {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${key}`).trim();
};

// Theme options
export const themeOptions = [
  { id: 'light', name: 'Light', icon: '' },
  { id: 'dark', name: 'Dark', icon: '' },
  { id: 'system', name: 'System', icon: '' },
];

export default {
  themes,
  getTheme,
  setTheme,
  applyTheme,
  getCSSVar,
  themeOptions,
};