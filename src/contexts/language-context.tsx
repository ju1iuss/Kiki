'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, detectLanguage, getLanguage, setLanguage } from '@/lib/language';
import { translations, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    // Always detect language on each visit to ensure accuracy
    // This ensures if user travels, language updates accordingly
    detectLanguage().then((detected) => {
      setLanguageState(detected);
      setLanguage(detected);
      setIsDetecting(false);
    }).catch(() => {
      // Fallback to stored preference if detection fails
      const stored = getLanguage();
      if (stored) {
        setLanguageState(stored);
      }
      setIsDetecting(false);
    });
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    setLanguage(lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  // Show children immediately with default language, update when detected
  // This prevents flash while still showing content

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

