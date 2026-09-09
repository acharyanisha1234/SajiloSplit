import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './AppRoutes';
import { getCurrentUser } from './store/slices/authSlice';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="min-h-screen" style={{ 
            backgroundColor: 'var(--background)',
            color: 'var(--text-primary)',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }}>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  border: '1px solid var(--border-light)',
                },
                success: {
                  iconTheme: {
                    primary: '#0EA5A5',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />
            <AppRoutes />
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;