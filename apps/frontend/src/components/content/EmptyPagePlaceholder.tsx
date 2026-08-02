'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface EmptyPagePlaceholderProps {
  title: string;
  slug?: string;
  message?: string;
}

export function EmptyPagePlaceholder({
  title,
  slug = '',
  message = 'There is currently no published content available for this page. Content will appear here once it has been reviewed and published. Please check back later.',
}: EmptyPagePlaceholderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus management for keyboard / screen reader users on page load
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const formattedTitle = title || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="region"
      aria-label={`No published content status for ${formattedTitle}`}
      className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center focus:outline-none"
    >
      {/* ARIA Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`No published content is currently available for ${formattedTitle}. Please check back later.`}
      </div>

      <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 backdrop-blur">
        {/* Status Badge */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500/10 border border-sky-400/30 text-sky-300 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" aria-hidden="true" />
            No Published Content Yet
          </span>
        </div>

        {/* Heading Hierarchy */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {formattedTitle}
          </h1>
          <h2 className="text-lg sm:text-xl font-bold text-slate-300">
            Content Pending Review & Publication
          </h2>
        </div>

        {/* Explanatory Message */}
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {message}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Please check back later or explore other sections of the Sandip Thapa Academic CMS Platform.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          <Link
            href="/"
            className="px-5 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-sky-400 focus:outline-none"
          >
            <span>🏠 Go to Home</span>
          </Link>

          <Link
            href="/about"
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-sky-400 focus:outline-none"
          >
            <span>📚 Browse Other Pages</span>
          </Link>

          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
              window.dispatchEvent(event);
            }}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-sky-400 focus:outline-none"
          >
            <span>🔍 Search Website</span>
            <kbd className="px-1.5 py-0.5 bg-slate-950 text-[10px] rounded border border-slate-700">Ctrl K</kbd>
          </button>

          <Link
            href="/contact"
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-sky-400 focus:outline-none"
          >
            <span>✉️ Contact</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
