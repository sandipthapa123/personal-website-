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
      <body className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-950 text-rose-400 rounded-full flex items-center justify-center text-3xl mx-auto font-bold">
            🚨
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold">Application Error</h1>
            <p className="text-sm text-slate-400">
              {error.message || 'A critical application error occurred.'}
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-md shadow transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
