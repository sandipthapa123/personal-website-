'use client';

import React, { useState, useEffect } from 'react';
import { ACCESSIBILITY_CONSTANTS } from '@cms/accessibility';

export const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [themeMode, setThemeMode] = useState<'default' | 'sepia' | 'dark'>('default');

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.style.lineHeight = `${lineSpacing}`;
  }, [lineSpacing]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    if (dyslexicFont) {
      document.body.style.fontFamily = 'OpenDyslexic, Comic Sans MS, sans-serif';
    } else {
      document.body.style.fontFamily = '';
    }
  }, [dyslexicFont]);

  useEffect(() => {
    document.documentElement.classList.remove('sepia', 'dark');
    if (themeMode === 'sepia') document.documentElement.classList.add('sepia');
    if (themeMode === 'dark') document.documentElement.classList.add('dark');
  }, [themeMode]);

  const announce = (msg: string) => {
    const el = document.getElementById(ACCESSIBILITY_CONSTANTS.LIVE_ANNOUNCER_ID);
    if (el) el.textContent = msg;
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Toggle Accessibility Controls Toolbar"
        className="w-12 h-12 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-2xl flex items-center justify-center text-xl focus-visible:ring"
      >
        ♿
      </button>

      {isOpen && (
        <div
          role="region"
          aria-label="Accessibility Preferences Panel"
          className="absolute bottom-16 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-2xl w-80 space-y-4 text-sm text-slate-800 dark:text-slate-200"
        >
          <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Accessibility Controls</h3>
            <button onClick={() => setIsOpen(false)} className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
              ✕ Close
            </button>
          </div>

          {/* Font Size Scaling */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Text Scale ({fontSize}%)</label>
            <div className="flex gap-2">
              <button
                onClick={() => { setFontSize((s) => Math.max(90, s - 10)); announce('Font size decreased'); }}
                className="flex-1 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold"
              >
                A-
              </button>
              <button
                onClick={() => { setFontSize(100); announce('Font size reset'); }}
                className="flex-1 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold"
              >
                Reset
              </button>
              <button
                onClick={() => { setFontSize((s) => Math.min(150, s + 10)); announce('Font size increased'); }}
                className="flex-1 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold"
              >
                A+
              </button>
            </div>
          </div>

          {/* Theme Mode */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Color Theme</label>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => { setThemeMode('default'); announce('Default light theme activated'); }}
                className={`flex-1 py-1.5 rounded border ${themeMode === 'default' ? 'border-sky-600 font-bold' : 'border-slate-200'}`}
              >
                Light
              </button>
              <button
                onClick={() => { setThemeMode('sepia'); announce('Sepia warm theme activated'); }}
                className={`flex-1 py-1.5 bg-amber-50 text-amber-900 rounded border ${themeMode === 'sepia' ? 'border-amber-600 font-bold' : 'border-amber-200'}`}
              >
                Sepia
              </button>
              <button
                onClick={() => { setThemeMode('dark'); announce('Dark mode theme activated'); }}
                className={`flex-1 py-1.5 bg-slate-950 text-white rounded border ${themeMode === 'dark' ? 'border-sky-400 font-bold' : 'border-slate-800'}`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Dyslexic Font & High Contrast */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Dyslexia-Friendly Font</span>
              <input
                type="checkbox"
                checked={dyslexicFont}
                onChange={(e) => { setDyslexicFont(e.target.checked); announce(e.target.checked ? 'Dyslexia font enabled' : 'Dyslexia font disabled'); }}
                className="w-4 h-4 rounded text-sky-600"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>High Contrast Mode</span>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => { setHighContrast(e.target.checked); announce(e.target.checked ? 'High contrast enabled' : 'High contrast disabled'); }}
                className="w-4 h-4 rounded text-sky-600"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
