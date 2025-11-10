'use client'

import { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from '@/contexts/language-context';
import { Language } from '@/lib/language';

function LanguageHtml({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Update html lang attribute
    document.documentElement.lang = language;
  }, [language]);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

export function LanguageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LanguageHtml>{children}</LanguageHtml>
    </LanguageProvider>
  );
}

