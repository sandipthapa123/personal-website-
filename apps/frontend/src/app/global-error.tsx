'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-[#121110] text-[#f3ede2] font-sans">
        <div className="max-w-md w-full bg-[#1e1b18] border border-[#36302a] rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-950 text-rose-400 rounded-full flex items-center justify-center text-2xl mx-auto font-bold border border-rose-800/40">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Application Error</h1>
            <p className="text-sm text-[#ab9f8f]">
              {error.message || 'A critical application error occurred.'}
            </p>
          </div>
          <button
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
