import React from 'react';
import Link from 'next/link';
import { buttonStyles } from '../components/ui/primitives';

const SUGGESTIONS = [
  { label: 'Articles & Essays', url: '/articles' },
  { label: 'Research Projects', url: '/research' },
  { label: 'Publications', url: '/publications' },
  { label: 'Contact', url: '/contact' },
];

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-4 py-16 sm:px-6">
      <div className="edge-lit relative w-full overflow-hidden rounded-3xl border border-ink-border bg-ink-elevated p-8 text-center shadow-xl shadow-black/10 sm:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
        />

        <div className="relative space-y-7">
          <p
            aria-hidden="true"
            className="font-serif-display bg-gradient-to-b from-gold-bright to-gold bg-clip-text text-7xl font-bold leading-none text-transparent sm:text-8xl"
          >
            404
          </p>

          <div className="space-y-2.5">
            <h1 className="font-serif-display text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
              Page not found
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-400">
              The page or research document you are looking for does not exist or has been moved.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className={buttonStyles('primary')}>
              Return to homepage
            </Link>
          </div>

          <nav aria-label="Suggested pages" className="border-t border-ink-border pt-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">Or try one of these</p>
            <ul className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s.url}>
                  <Link
                    href={s.url}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-ink-border bg-ink px-4 py-2 text-xs font-semibold text-ink-100 transition hover:border-gold/60 hover:text-gold-text"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
