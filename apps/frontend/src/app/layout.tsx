import type { Metadata } from 'next';
import './globals.css';
import { ACCESSIBILITY_CONSTANTS } from '@cms/accessibility';

export const metadata: Metadata = {
  title: 'thapasandip.com.np - Platform-Driven Engine CMS',
  description: 'Enterprise Backend-Driven Personal Website & CMS Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a
          id={ACCESSIBILITY_CONSTANTS.SKIP_LINK_ID}
          href={`#${ACCESSIBILITY_CONSTANTS.MAIN_CONTENT_ID}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-600 focus:text-white focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <div id={ACCESSIBILITY_CONSTANTS.LIVE_ANNOUNCER_ID} className="sr-only" aria-live="polite" aria-atomic="true" />
        <main id={ACCESSIBILITY_CONSTANTS.MAIN_CONTENT_ID}>
          {children}
        </main>
      </body>
    </html>
  );
}
