'use client';

import React, { useEffect } from 'react';
import { ACCESSIBILITY_CONSTANTS } from '@cms/accessibility';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Announce error to screen readers
    const announcer = document.getElementById(ACCESSIBILITY_CONSTANTS.LIVE_ANNOUNCER_ID);
    if (announcer) {
      announcer.textContent = 'An error occurred while loading this page.';
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center text-3xl mx-auto font-bold">
          ⚠️
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Something went wrong!</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {error.message || 'An unexpected error occurred while rendering content.'}
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-md shadow transition-colors focus-visible:ring"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-md transition-colors focus-visible:ring"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
