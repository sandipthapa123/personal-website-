'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Frontend rendering error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Something went wrong!</h1>
        <p className="text-slate-400">
          We encountered an unexpected error while rendering this page. The layout schema might be malformed or the server could be temporarily unreachable.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors focus:ring-4 focus:ring-sky-500/30"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors focus:ring-4 focus:ring-slate-500/30"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
