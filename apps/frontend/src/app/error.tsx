'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { buttonStyles } from '../components/ui/primitives';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Frontend rendering error:', error);
    // Move focus to the error so screen reader / keyboard users land on it immediately.
    headingRef.current?.focus();
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-4 py-16 sm:px-6">
      <div
        role="alert"
        className="edge-lit relative w-full overflow-hidden rounded-3xl border border-errorText/30 bg-ink-elevated p-8 text-center shadow-xl shadow-black/10 sm:p-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-errorText/10 blur-3xl"
        />

        <div className="relative space-y-7">
          <span
            aria-hidden="true"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-errorText/40 bg-errorText/10 text-2xl text-errorText"
          >
            !
          </span>

          <div className="space-y-2.5">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-serif-display text-2xl font-semibold tracking-tight text-ink-100 focus:outline-none sm:text-3xl"
            >
              Something went wrong
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-400">
              We encountered an unexpected error while rendering this page. The layout schema might be malformed or the
              server could be temporarily unreachable.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => reset()} className={buttonStyles('primary')}>
              Try again
            </button>
            <Link href="/" className={buttonStyles('secondary')}>
              Return home
            </Link>
          </div>

          {error.digest && (
            <p className="border-t border-ink-border pt-5 font-mono text-[11px] text-ink-400">
              Reference: <span className="text-ink-100">{error.digest}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
