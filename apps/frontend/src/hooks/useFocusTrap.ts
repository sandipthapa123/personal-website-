'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface UseFocusTrapOptions {
  /** Whether the trap is currently active (e.g. a dialog/drawer is open). */
  active: boolean;
  /** Container the trap operates within. */
  containerRef: RefObject<HTMLElement | null>;
  /** Called when Escape is pressed while the trap is active. */
  onClose?: () => void;
  /** Element to focus first when the trap activates. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Standard WCAG 2.2 modal focus-trap: moves focus in on open, cycles Tab/Shift+Tab
 * within the container, closes on Escape, and restores focus to whatever triggered
 * the dialog when it closes (2.4.3 Focus Order, 3.2.1 On Focus, and the AAA-adjacent
 * "no focus loss" expectation from the ARIA Authoring Practices dialog pattern).
 */
export function useFocusTrap({ active, containerRef, onClose, initialFocusRef }: UseFocusTrapOptions) {
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    triggerElementRef.current = document.activeElement as HTMLElement | null;

    const focusTarget = initialFocusRef?.current ?? containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    focusTarget?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusables = Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      triggerElementRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
