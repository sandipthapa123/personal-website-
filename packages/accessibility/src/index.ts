/**
 * @cms/accessibility - WCAG 2.2 AAA Utilities & Constants
 */

export const ACCESSIBILITY_CONSTANTS = {
  SKIP_LINK_ID: 'skip-to-main-content',
  MAIN_CONTENT_ID: 'main-content-landmark',
  LIVE_ANNOUNCER_ID: 'aria-live-global-announcer',
} as const;

export type AnnouncePoliteness = 'polite' | 'assertive' | 'off';

export interface IAccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSizeScale: number; // 1.0 = normal, 1.25 = large, 1.5 = extra large
  screenReaderOptimized: boolean;
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES: IAccessibilityPreferences = {
  highContrast: false,
  reducedMotion: false,
  fontSizeScale: 1.0,
  screenReaderOptimized: false,
};
