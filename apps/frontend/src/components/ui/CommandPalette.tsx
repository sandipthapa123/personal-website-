'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CmsApiClient } from '@cms/api-client';
import { SearchIcon } from './Icon';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const handler = setTimeout(() => {
      const apiClient = new CmsApiClient({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000',
      });

      apiClient
        .getRenderPage(query)
        .then((res) => {
          if (res.data?.page) {
            setResults([{ id: `page-${res.data.page.slug}`, title: res.data.page.title, url: `/${res.data.page.slug}`, type: 'Page' }]);
          } else {
            setResults([
              { id: `search-${query}`, title: `Search for "${query}"`, url: `/search?q=${query}`, type: 'Search' },
            ]);
          }
        })
        .catch(() => {
          setResults([
            { id: `search-${query}`, title: `Search for "${query}"`, url: `/search?q=${query}`, type: 'Search' },
          ]);
        });
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Universal Command Palette Search"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-ink/70 backdrop-blur-sm p-4"
    >
      <div className="bg-ink-elevated border border-ink-border rounded-2xl shadow-2xl shadow-black/40 w-full max-w-xl overflow-hidden">
        <div className="p-4 border-b border-ink-border flex items-center gap-3">
          <SearchIcon className="text-lg text-ink-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, research, publications (Ctrl+K)..."
            className="w-full bg-transparent text-ink-100 placeholder-ink-400/60 focus:outline-none text-base"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs px-2 py-1 bg-ink border border-ink-border rounded text-ink-400"
          >
            ESC
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && query ? (
            <p className="p-4 text-center text-sm text-ink-400">Searching...</p>
          ) : results.length === 0 ? (
            <div className="p-4 text-xs text-ink-400 space-y-2">
              <p className="font-semibold uppercase tracking-wider text-ink-100">Quick Commands</p>
              <ul className="space-y-1 text-ink-400">
                <li>Type title or keyword to search</li>
                <li>Navigate to /research or /publications</li>
                <li>Press ESC to close</li>
              </ul>
            </div>
          ) : (
            results.map((r) => (
              <Link
                key={r.id || r.url}
                href={r.url}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-ink transition-colors text-sm"
              >
                <span className="font-medium text-ink-100">{r.title}</span>
                <span className="text-xs px-2 py-0.5 bg-gold/10 text-gold rounded">
                  {r.type}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
