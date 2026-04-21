'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LangContext = createContext({ lang: 'en', setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('vs-lang');
    if (saved === 'de') setLang('de');
  }, []);

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('vs-lang', l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang: changeLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  const { lang } = useLang();
  return translations[lang];
}
