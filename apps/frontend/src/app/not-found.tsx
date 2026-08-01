import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-xl text-center space-y-6">
        <div className="text-6xl font-black text-sky-600 dark:text-sky-400">404</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The page or research document you are looking for does not exist or has been moved.
          </p>
        </div>
        <a
          href="/"
          className="inline-block px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-md shadow transition-colors"
        >
          Return to Homepage
        </a>
      </div>
    </div>
  );
}
