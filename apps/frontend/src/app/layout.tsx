import type { Metadata } from 'next';
import { Noto_Sans, Noto_Sans_Devanagari, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ACCESSIBILITY_CONSTANTS } from '@cms/accessibility';
import { AccessibilityToolbar } from '../components/accessibility/AccessibilityToolbar';
import { CommandPalette } from '../components/ui/CommandPalette';
import { HeaderNav } from '../components/layout/HeaderNav';
import { FooterNav } from '../components/layout/FooterNav';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sandip Thapa | Academic Research, Law & Accessibility Platform',
  description: 'Enterprise Backend-Driven Personal Website & Knowledge Management System for Sandip Thapa',
};

import { DialogProvider } from '../components/dialogs/DialogProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSans.variable} ${notoSansDevanagari.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between font-sans">
        <DialogProvider>
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
        </DialogProvider>
      </body>
    </html>
  );
}
