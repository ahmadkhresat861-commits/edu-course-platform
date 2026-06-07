import React, { createContext, useContext, useState } from 'react';
import { translations } from './i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');
  const isAr = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, isAr }}>
      <div dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Arial, sans-serif' : 'Inter, sans-serif' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);