import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { readStore, writeStore } from '../lib/storage';
import type { L10n, Lang } from './types';

export const LANG_KEY = 'egs.lang';

type LangContextValue = { lang: Lang; setLang(l: Lang): void; t(text: L10n): string };

const LangContext = createContext<LangContextValue | null>(null);

function initialLang(): Lang {
  return readStore('local', LANG_KEY) === 'id' ? 'id' : 'en';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeStore('local', LANG_KEY, l);
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang, t: (text) => text[lang] }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
