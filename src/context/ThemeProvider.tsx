import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../lib/storage';

interface ThemeCtxValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

const ThemeCtx = createContext<ThemeCtxValue>({
  settings: DEFAULT_SETTINGS,
  update: () => {},
});

export function resolveTheme(mode: Settings['theme']): 'light' | 'dark' {
  if (mode === 'auto') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  }
  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolveTheme(settings.theme));
  }, [settings.theme]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  const value = useMemo(() => ({ settings, update }), [settings]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useSettings(): ThemeCtxValue {
  return useContext(ThemeCtx);
}
