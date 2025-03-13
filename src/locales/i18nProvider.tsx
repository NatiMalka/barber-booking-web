'use client';

import { ReactNode, useEffect } from 'react';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';

export default function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Force RTL direction for Hebrew
    document.documentElement.dir = 'rtl';
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
} 