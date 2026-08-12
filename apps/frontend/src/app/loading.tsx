import React from 'react';
import { Skeleton } from '../components/ui/primitives';

/**
 * Content-shaped skeleton rather than a bare spinner: it reserves the real
 * layout so there is no jump when content arrives, and it communicates *what*
 * is loading. The whole thing is aria-hidden and the status is announced once
 * via a single polite live region, so a screen reader hears one clear message
 * instead of a burst of meaningless boxes.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <p className="sr-only" role="status" aria-live="polite">
        Loading content, please wait.
      </p>

      <div aria-hidden="true" className="space-y-14">
        {/* Hero */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <Skeleton className="mx-auto aspect-[4/5] w-full max-w-sm rounded-[1.75rem] lg:max-w-none" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-56 rounded-full" />
            <Skeleton className="h-14 w-4/5" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-11 w-44 rounded-full" />
              <Skeleton className="h-11 w-40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Section heading + card grid */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-0.5 w-12 rounded-full" />
          <div className="grid gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 rounded-2xl border border-ink-border p-6">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
