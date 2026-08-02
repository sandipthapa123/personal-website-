import type { Metadata } from 'next';
import './globals.css';
import { ACCESSIBILITY_CONSTANTS } from '@cms/accessibility';
import { AccessibilityToolbar } from '../components/accessibility/AccessibilityToolbar';
import { CommandPalette } from '../components/ui/CommandPalette';
import { HeaderNav } from '../components/layout/HeaderNav';
import { FooterNav } from '../components/layout/FooterNav';

export const metadata: Metadata = {
  title: 'Sandip Thapa | Academic Research, Law & Accessibility Platform',
  description: 'Enterprise Backend-Driven Personal Website & Knowledge Management System for Sandip Thapa',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between">
        <div>
          <a
            id={ACCESSIBILITY_CONSTANTS.SKIP_LINK_ID}
            href={`#${ACCESSIBILITY_CONSTANTS.MAIN_CONTENT_ID}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-600 focus:text-white focus:rounded-md focus:shadow-lg"
          >
            Skip to main content
          </a>
          <div id={ACCESSIBILITY_CONSTANTS.LIVE_ANNOUNCER_ID} className="sr-only" aria-live="polite" aria-atomic="true" />
          <CommandPalette />
          <AccessibilityToolbar />
          <HeaderNav />
          <main id={ACCESSIBILITY_CONSTANTS.MAIN_CONTENT_ID}>
            {children}
          </main>
        </div>
        <FooterNav />
      </body>
    </html>
  );
}
