'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

interface INavItem {
  label: string;
  url: string;
  icon?: string;
  children?: { label: string; url: string }[];
}

interface SearchResult {
  id: string;
  entityType: string;
  title: string;
  summary?: string;
  url: string;
  category?: string;
}

const DEFAULT_MAIN_NAVIGATION: INavItem[] = [
  { label: 'Home', url: '/', icon: '🏠' },
  {
    label: 'About',
    url: '/about',
    icon: '👤',
    children: [
      { label: 'Biography', url: '/about/biography' },
      { label: 'Education', url: '/about/education' },
      { label: 'Experience', url: '/about/experience' },
      { label: 'Skills', url: '/about/skills' },
      { label: 'CV / Resume', url: '/about/resume' },
    ],
  },
  {
    label: 'Articles',
    url: '/articles',
    icon: '📰',
    children: [
      { label: 'All Articles', url: '/articles' },
      { label: 'Categories', url: '/articles/categories' },
      { label: 'Tags', url: '/articles/tags' },
      { label: 'Series', url: '/articles/series' },
    ],
  },
  {
    label: 'Research',
    url: '/research',
    icon: '🔬',
    children: [
      { label: 'Research Projects', url: '/research/projects' },
      { label: 'Working Papers', url: '/research/working-papers' },
      { label: 'Policy Briefs', url: '/research/policy-briefs' },
      { label: 'Reports', url: '/research/reports' },
    ],
  },
  {
    label: 'Publications',
    url: '/publications',
    icon: '📚',
    children: [
      { label: 'Journal Articles', url: '/publications/journal-articles' },
      { label: 'Book Chapters', url: '/publications/book-chapters' },
      { label: 'Conference Papers', url: '/publications/conference-papers' },
      { label: 'Books', url: '/publications/books' },
    ],
  },
  {
    label: 'Poems',
    url: '/poems',
    icon: '✍️',
    children: [
      { label: 'All Poems', url: '/poems' },
      { label: 'Collections', url: '/poems/collections' },
    ],
  },
  { label: 'Translations', url: '/translations', icon: '🌐' },
  { label: 'Projects', url: '/projects', icon: '🗂️' },
  {
    label: 'Media',
    url: '/media',
    icon: '🎙️',
    children: [
      { label: 'Interviews', url: '/media/interviews' },
      { label: 'Podcasts', url: '/media/podcasts' },
      { label: 'Videos', url: '/media/videos' },
      { label: 'News', url: '/media/news' },
    ],
  },
  {
    label: 'Services',
    url: '/services',
    icon: '⚖️',
    children: [
      { label: 'Legal Research', url: '/services/legal-research' },
      { label: 'Translation', url: '/services/translation' },
      { label: 'Accessibility Consulting', url: '/services/accessibility-consulting' },
      { label: 'Training', url: '/services/training' },
      { label: 'Speaking', url: '/services/speaking' },
    ],
  },
  { label: 'Testimonials', url: '/testimonials', icon: '💬' },
  { label: 'FAQ', url: '/faq', icon: '❓' },
  { label: 'Contact', url: '/contact', icon: '📬' },
];

export function HeaderNav() {
  const [navItems, setNavItems] = useState<INavItem[]>(DEFAULT_MAIN_NAVIGATION);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch navigation from backend
  useEffect(() => {
    fetch('http://localhost:4000/api/v1/navigation/main')
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setNavItems(data.items);
        }
      })
      .catch(() => {
        // Retain DEFAULT_MAIN_NAVIGATION
      });
  }, []);

  // Global keyboard listener (Ctrl+K / Cmd+K for search)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Debounced search
  const performSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    fetch(`http://localhost:4000/api/v1/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        setSearchResults(Array.isArray(data.data) ? data.data : []);
        setSearching(false);
      })
      .catch(() => {
        setSearching(false);
      });
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => performSearch(val), 350);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ──────────────────────────────── Header ────────────────────────────── */}
      <header
        id="site-header"
        className="bg-slate-950/95 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur shadow-md"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0" aria-label="Sandip Thapa - Home">
            <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg group-hover:bg-sky-500 transition-colors">
              ST
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-sky-300 transition-colors">
                Sandip Thapa
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Law, Research &amp; Accessibility</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden xl:flex items-center gap-0.5 text-[11px] font-semibold flex-1 justify-center"
            aria-label="Main navigation"
            id="main-nav"
          >
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.url}
                  className="px-2.5 py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap"
                  aria-haspopup={item.children ? 'true' : undefined}
                  aria-expanded={activeDropdown === item.label ? 'true' : undefined}
                >
                  {item.label}
                  {item.children && <span className="text-[9px] opacity-50">▾</span>}
                </Link>

                {item.children && activeDropdown === item.label && (
                  <div
                    className="absolute left-0 top-full mt-1 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 space-y-0.5 z-50"
                    role="menu"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.url}
                        className="block px-4 py-2 text-slate-300 hover:text-sky-300 hover:bg-slate-800/80 text-xs transition-colors"
                        role="menuitem"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Search button */}
            <button
              onClick={openSearch}
              aria-label="Open search (Ctrl+K)"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              <span>🔍 Search</span>
              <kbd className="hidden md:block px-1.5 py-0.5 bg-slate-950 rounded text-[10px] border border-slate-800">⌃K</kbd>
            </button>

            {/* Mobile search icon */}
            <button
              onClick={openSearch}
              aria-label="Search"
              className="sm:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              🔍
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              className="xl:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────── Mobile Navigation Panel ────────────────────────────── */}
      {mobileOpen && (
        <div
          id="mobile-nav-panel"
          className="xl:hidden fixed top-[56px] left-0 right-0 bottom-0 bg-slate-950/98 backdrop-blur z-30 overflow-y-auto"
          aria-label="Mobile navigation"
          role="dialog"
          aria-modal="true"
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between">
                  <Link
                    href={item.url}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 flex-1 px-4 py-3 text-slate-200 hover:text-white hover:bg-slate-900 rounded-xl font-semibold text-sm transition-colors"
                  >
                    {item.icon && <span>{item.icon}</span>}
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      className="px-3 py-3 text-slate-400 hover:text-white transition-colors"
                      aria-label={`Expand ${item.label}`}
                    >
                      <span className="text-xs">{mobileExpanded === item.label ? '▲' : '▼'}</span>
                    </button>
                  )}
                </div>

                {item.children && mobileExpanded === item.label && (
                  <div className="ml-10 mb-2 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.url}
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-2 text-slate-400 hover:text-sky-300 hover:bg-slate-900 rounded-lg text-xs transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-slate-800 mt-4">
              <a
                href="http://localhost:4000/admin/login"
                className="flex items-center gap-2 px-4 py-3 text-sky-400 text-xs font-semibold rounded-xl hover:bg-slate-900 transition-colors"
              >
                🔐 Backend Admin Console
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* ──────────────────────────────── Search Overlay ────────────────────────────── */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur z-50 flex items-start justify-center pt-20 px-4"
          role="dialog"
          aria-label="Site search"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
              <span className="text-slate-400 text-lg">🔍</span>
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Search articles, research, publications, poems..."
                aria-label="Search the website"
                className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-500 outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-slate-500 hover:text-white px-2 py-1 text-xs font-semibold transition-colors"
                aria-label="Close search"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {searching && (
                <div className="p-8 text-center text-slate-500 text-sm animate-pulse">Searching...</div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-slate-400 text-sm">No results found for &quot;<strong className="text-white">{searchQuery}</strong>&quot;</p>
                  <p className="text-slate-600 text-xs mt-2">Try a different keyword or browse navigation above.</p>
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <ul role="listbox" aria-label="Search results" className="divide-y divide-slate-800/50">
                  {searchResults.map((result) => (
                    <li key={result.id} role="option">
                      <a
                        href={result.url}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                        className="flex items-start gap-3 px-5 py-4 hover:bg-slate-800/60 transition-colors group"
                      >
                        <span className="mt-0.5 px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-bold rounded uppercase tracking-wider flex-shrink-0">
                          {result.entityType}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-200 group-hover:text-sky-300 transition-colors leading-snug">{result.title}</p>
                          {result.summary && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{result.summary}</p>
                          )}
                          {result.category && (
                            <span className="inline-block mt-1 text-[10px] text-sky-500 font-medium">{result.category}</span>
                          )}
                        </div>
                        <span className="text-slate-600 group-hover:text-slate-400 text-sm flex-shrink-0">→</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {!searching && !searchQuery && (
                <div className="p-6 space-y-3">
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Quick Links</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '📰 Articles', url: '/articles' },
                      { label: '🔬 Research', url: '/research' },
                      { label: '📚 Publications', url: '/publications' },
                      { label: '✍️ Poems', url: '/poems' },
                      { label: '⚖️ Services', url: '/services' },
                      { label: '📬 Contact', url: '/contact' },
                    ].map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        onClick={() => setSearchOpen(false)}
                        className="px-3 py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
