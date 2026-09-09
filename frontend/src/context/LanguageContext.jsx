import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { translations, getLanguage as getSavedLang, setLanguage as setSavedLang } from '../utils/translations';

// Get saved language
const getSavedLanguage = async () => {
  // Check localStorage first
  const localLang = localStorage.getItem('language');
  if (localLang) return localLang;
  
  // Try to get from backend
  try {
    const response = await axios.get('/api/users/settings');
    if (response.data?.data?.language) {
      return response.data.data.language;
    }
  } catch (error) {
    console.log('Could not fetch language from backend');
  }
  
  return 'en';
};

// Language options
const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
];

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLanguage = async () => {
      const savedLang = await getSavedLanguage();
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
      setLoading(false);
    };
    initLanguage();
  }, []);

  const changeLanguage = async (newLang) => {
    if (!translations[newLang]) return;
    
    setLanguageState(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.lang = newLang;
    
    // Save to backend
    try {
      await axios.put('/api/users/settings', { language: newLang });
    } catch (error) {
      console.log('Could not save language to backend');
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: newLang } }));
  };

 
  const translate = (key) => {
    const langData = translations[language] || translations.en;
    return langData[key] || translations.en[key] || key;
  };

  const t = translate;

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        changeLanguage, 
        translate,
        t,  // ✅ Export t function
        options: LANGUAGE_OPTIONS,
        isEnglish: language === 'en',
        isNepali: language === 'ne',
        loading
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageContext;