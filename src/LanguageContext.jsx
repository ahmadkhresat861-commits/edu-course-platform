import React, { createContext, useContext, useState } from 'react';
import { translations } from './i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const t = translations[lang];
  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');
  const toggleDark = () => setDarkMode(!darkMode);
  const isAr = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, isAr, darkMode, toggleDark }}>
      <div dir={isAr ? 'rtl' : 'ltr'}
        style={{
          fontFamily: isAr ? 'Arial, sans-serif' : 'Inter, sans-serif',
          background: darkMode ? '#0f0f0f' : '#f5f5f5',
          color: darkMode ? '#f0f0f0' : '#1a1a1a',
          minHeight: '100vh',
          transition: 'all 0.3s'
        }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);