'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { HomeIcon, BookIcon, SearchIcon, MailIcon } from '../ui/Icon';

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
      <div className="max-w-2xl w-full bg-ink-elevated/90 border border-ink-border rounded-3xl p-8 sm:p-12 shadow-2xl shadow-black/30 space-y-8 backdrop-blur">
        {/* Status Badge */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold-text/30 text-gold-text rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-gold-text animate-pulse motion-reduce:animate-none" aria-hidden="true" />
            No Published Content Yet
          </span>
        </div>

        {/* Heading Hierarchy */}
        <div className="space-y-3">
          <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold text-ink-100 tracking-tight leading-tight">
            {formattedTitle}
          </h1>
          <h2 className="text-lg sm:text-xl font-bold text-ink-400">
            Content Pending Review &amp; Publication
          </h2>
        </div>

        {/* Explanatory Message */}
        <div className="p-6 bg-ink/80 border border-ink-border rounded-2xl space-y-2">
          <p className="text-ink-100 text-sm sm:text-base leading-relaxed">
            {message}
          </p>
          <p className="text-xs text-ink-400 font-medium">
            Please check back later or explore other sections of the Sandip Thapa Academic CMS Platform.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          <Link
            href="/"
            className="px-5 py-3 bg-gold hover:brightness-110 text-onGold font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <HomeIcon className="text-sm" /> Go to Home
          </Link>

          <Link
            href="/about"
            className="px-5 py-3 bg-ink-raised hover:bg-ink-border text-ink-100 border border-ink-border font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <BookIcon className="text-sm" /> Browse Other Pages
          </Link>

          <button
            type="button"
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
              window.dispatchEvent(event);
            }}
            className="px-5 py-3 bg-ink-raised hover:bg-ink-border text-ink-100 border border-ink-border font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <SearchIcon className="text-sm" /> Search Website
            <kbd className="px-1.5 py-0.5 bg-ink text-[10px] rounded border border-ink-border">Ctrl K</kbd>
          </button>

          <Link
            href="/contact"
            className="px-5 py-3 bg-ink hover:bg-ink-raised text-gold-text border border-gold-text/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <MailIcon className="text-sm" /> Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
