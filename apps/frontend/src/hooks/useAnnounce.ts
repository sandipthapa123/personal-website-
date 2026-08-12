'use client';

import { useCallback } from 'react';
import { ACCESSIBILITY_CONSTANTS } from '@cms/accessibility';

/**
 * Writes a message into the single global aria-live region (see layout.tsx).
 * Re-announces identical consecutive messages by briefly clearing the node first —
 * screen readers only fire on a text-content *change*.
 */
export function useAnnounce() {
  return useCallback((message: string) => {
    const el = document.getElementById(ACCESSIBILITY_CONSTANTS.LIVE_ANNOUNCER_ID);
    if (!el) return;
    el.textContent = '';
    window.setTimeout(() => {
      el.textContent = message;
    }, 50);
  }, []);
}
