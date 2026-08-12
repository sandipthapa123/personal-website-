'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeName = 'light' | 'dark' | 'sepia';

export interface IThemePreferences {
  theme: ThemeName;
  highContrast: boolean;
  dyslexiaMode: boolean;
  fontScale: number; // percent, 90-150
  lineSpacing: number; // unitless line-height, 1.5-2.2
}

const DEFAULT_PREFS: IThemePreferences = {
  theme: 'light',
  highContrast: false,
  dyslexiaMode: false,
  fontScale: 100,
  lineSpacing: 1.5,
};

export const THEME_STORAGE_KEY = 'thapasandip-a11y-prefs-v1';

interface IThemeContext extends IThemePreferences {
  setTheme: (theme: ThemeName) => void;
  setHighContrast: (value: boolean) => void;
  setDyslexiaMode: (value: boolean) => void;
  setFontScale: (value: number) => void;
  setLineSpacing: (value: number) => void;
  resetPreferences: () => void;
}

const ThemeContext = createContext<IThemeContext | null>(null);

function applyToDocument(prefs: IThemePreferences) {
  const root = document.documentElement;
  root.dataset.theme = prefs.theme;
  root.classList.toggle('a11y-high-contrast', prefs.highContrast);
  root.classList.toggle('a11y-dyslexia-friendly', prefs.dyslexiaMode);
  root.style.fontSize = `${prefs.fontScale}%`;
  root.style.setProperty('--user-line-height', String(prefs.lineSpacing));
}

/**
 * Owns theme + reading/accessibility preferences for the whole site. The actual
 * initial paint (before this component mounts) is handled by the inline script in
 * layout.tsx, which reads the same localStorage key and sets the same DOM
 * attributes synchronously to avoid a flash of the wrong theme.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<IThemePreferences>(DEFAULT_PREFS);

  // Sync React state from whatever the anti-flash script already applied to the DOM.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — fall back to defaults.
    }
  }, []);

  useEffect(() => {
    applyToDocument(prefs);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore write failures (quota, private mode).
    }
  }, [prefs]);

  const setTheme = useCallback((theme: ThemeName) => setPrefs((p) => ({ ...p, theme })), []);
  const setHighContrast = useCallback((highContrast: boolean) => setPrefs((p) => ({ ...p, highContrast })), []);
  const setDyslexiaMode = useCallback((dyslexiaMode: boolean) => setPrefs((p) => ({ ...p, dyslexiaMode })), []);
  const setFontScale = useCallback((fontScale: number) => setPrefs((p) => ({ ...p, fontScale })), []);
  const setLineSpacing = useCallback((lineSpacing: number) => setPrefs((p) => ({ ...p, lineSpacing })), []);
  const resetPreferences = useCallback(() => setPrefs(DEFAULT_PREFS), []);

  return (
    <ThemeContext.Provider
      value={{ ...prefs, setTheme, setHighContrast, setDyslexiaMode, setFontScale, setLineSpacing, resetPreferences }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/**
 * Source for the blocking anti-flash script rendered in layout.tsx. Kept as a
 * plain string (not imported) so it can be inlined without any bundler wrapping.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});var p=s?JSON.parse(s):{};var root=document.documentElement;root.dataset.theme=p.theme||'light';if(p.highContrast)root.classList.add('a11y-high-contrast');if(p.dyslexiaMode)root.classList.add('a11y-dyslexia-friendly');root.style.fontSize=(p.fontScale||100)+'%';root.style.setProperty('--user-line-height',String(p.lineSpacing||1.5));}catch(e){}})();`;
