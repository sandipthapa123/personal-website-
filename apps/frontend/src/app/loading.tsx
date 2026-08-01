import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white space-y-4">
      <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
        Loading backend-driven layout & content...
      </p>
    </div>
  );
}
