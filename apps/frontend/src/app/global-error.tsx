'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // This replaces the entire document (including <html>/<body>) when a root-level
  // error occurs, so it cannot rely on ThemeProvider, next/font variables, or the
  // data-theme attribute — hence the hardcoded, theme-independent colors below,
  // matching the site's light default so the fallback doesn't look jarring.
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-[#fbf8f2] text-[#1c1712] font-sans">
        <div className="max-w-md w-full bg-[#fffffd] border border-[#e0d6c4] rounded-2xl p-8 shadow-2xl text-center space-y-6" role="alert">
          <div
            className="w-16 h-16 bg-[#fbe4e4] text-[#a3231f] rounded-full flex items-center justify-center text-2xl mx-auto font-bold border border-[#e8b4b2]"
            aria-hidden="true"
          >
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Application Error</h1>
            <p className="text-sm text-[#5a4d3d]">
              {error.message || 'A critical application error occurred.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-2.5 bg-[#c7a04c] hover:brightness-110 text-[#121110] text-sm font-semibold rounded-lg shadow transition-all"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
