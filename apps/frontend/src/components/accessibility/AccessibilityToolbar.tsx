'use client';

import React, { useState, useRef } from 'react';
import { AccessibilityIcon, CloseIcon } from '../ui/Icon';
import { useTheme, type ThemeName } from '../theme/ThemeProvider';
import { useAnnounce } from '../../hooks/useAnnounce';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'dark', label: 'Dark' },
];

export const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    theme,
    setTheme,
    highContrast,
    setHighContrast,
    dyslexiaMode,
    setDyslexiaMode,
    fontScale,
    setFontScale,
    lineSpacing,
    setLineSpacing,
    resetPreferences,
  } = useTheme();
  const announce = useAnnounce();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap({ active: isOpen, containerRef: panelRef, onClose: () => setIsOpen(false) });

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        ref={toggleButtonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        aria-label="Toggle accessibility and reading preferences"
        className="w-12 h-12 bg-gold hover:brightness-110 text-onGold rounded-full shadow-2xl shadow-black/30 flex items-center justify-center text-xl transition-all"
      >
        <AccessibilityIcon className="text-2xl" />
      </button>

      {isOpen && (
        <div
          id="accessibility-panel"
          ref={panelRef}
          role="region"
          aria-label="Accessibility and reading preferences"
          className="absolute bottom-16 right-0 bg-ink-elevated border border-ink-border p-5 rounded-2xl shadow-2xl shadow-black/40 w-80 max-w-[calc(100vw-2rem)] space-y-5 text-sm text-ink-100"
        >
          <div className="flex items-center justify-between border-b pb-2 border-ink-border">
            <h2 className="font-serif-display font-semibold text-ink-100 text-base">Accessibility</h2>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                toggleButtonRef.current?.focus();
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-ink border border-ink-border rounded hover:border-gold-text/50"
            >
              <CloseIcon className="text-[10px]" /> Close
            </button>
          </div>

          {/* Text Scale */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-400 uppercase tracking-wide" htmlFor="a11y-font-scale">
              Text size ({fontScale}%)
            </label>
            <input
              id="a11y-font-scale"
              type="range"
              min={90}
              max={150}
              step={10}
              value={fontScale}
              onChange={(e) => {
                const v = Number(e.target.value);
                setFontScale(v);
                announce(`Text size set to ${v}%`);
              }}
              className="w-full accent-gold"
            />
          </div>

          {/* Line Spacing */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-400 uppercase tracking-wide" htmlFor="a11y-line-spacing">
              Line spacing ({lineSpacing.toFixed(1)}×)
            </label>
            <input
              id="a11y-line-spacing"
              type="range"
              min={1.5}
              max={2.5}
              step={0.1}
              value={lineSpacing}
              onChange={(e) => {
                const v = Number(e.target.value);
                setLineSpacing(v);
                announce(`Line spacing set to ${v.toFixed(1)} times`);
              }}
              className="w-full accent-gold"
            />
          </div>

          {/* Theme */}
          <fieldset className="space-y-1.5">
            <legend className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-1">Color theme</legend>
            <div className="flex gap-2 text-xs" role="radiogroup" aria-label="Color theme">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={theme === opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    announce(`${opt.label} theme activated`);
                  }}
                  className={`flex-1 py-1.5 rounded-lg border font-semibold transition-colors ${
                    theme === opt.value
                      ? 'border-gold bg-gold/10 text-gold-text'
                      : 'border-ink-border bg-ink text-ink-400 hover:text-ink-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-ink-border">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span>Dyslexia-friendly spacing</span>
              <input
                type="checkbox"
                checked={dyslexiaMode}
                onChange={(e) => {
                  setDyslexiaMode(e.target.checked);
                  announce(e.target.checked ? 'Dyslexia-friendly spacing enabled' : 'Dyslexia-friendly spacing disabled');
                }}
                className="w-4 h-4 rounded accent-gold"
              />
            </label>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span>High contrast mode</span>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => {
                  setHighContrast(e.target.checked);
                  announce(e.target.checked ? 'High contrast mode enabled' : 'High contrast mode disabled');
                }}
                className="w-4 h-4 rounded accent-gold"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              resetPreferences();
              announce('Accessibility preferences reset to defaults');
            }}
            className="w-full text-center text-xs font-semibold text-ink-400 hover:text-ink-100 pt-2 border-t border-ink-border transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
};
