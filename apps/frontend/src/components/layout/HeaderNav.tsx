'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  { label: 'Home', url: '/' },
  {
    label: 'About',
    url: '/about',
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
    children: [
      { label: 'All Poems', url: '/poems' },
      { label: 'Collections', url: '/poems/collections' },
    ],
  },
  { label: 'Translations', url: '/translations' },
  { label: 'Projects', url: '/projects' },
  {
    label: 'Media',
    url: '/media',
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
    children: [
      { label: 'Legal Research', url: '/services/legal-research' },
      { label: 'Translation', url: '/services/translation' },
      { label: 'Accessibility Consulting', url: '/services/accessibility-consulting' },
      { label: 'Training', url: '/services/training' },
      { label: 'Speaking', url: '/services/speaking' },
    ],
  },
  { label: 'Testimonials', url: '/testimonials' },
  { label: 'FAQ', url: '/faq' },
  { label: 'Contact', url: '/contact' },
];

export function HeaderNav() {
  const router = useRouter();
  const [navItems, setNavItems] = useState<INavItem[]>(DEFAULT_MAIN_NAVIGATION);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);

  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive Breakpoint Detection (Desktop >= 1024px)
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch navigation from backend
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
    fetch(`${apiBase}/navigation/main`)
      .then((r) => r.json())
      .then((res) => {
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setNavItems(res.data);
        }
      })
      .catch(() => {
        // Retain DEFAULT_MAIN_NAVIGATION
      });
  }, []);

  // Keyboard accessibility (Esc & Focus Trap for Mobile Drawer)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setMobileOpen(false);
      }
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (mobileOpen) {
          setMobileOpen(false);
          hamburgerButtonRef.current?.focus();
        }
      }
      if (searchOpen && searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveOptionIndex((i) => (i + 1) % searchResults.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveOptionIndex((i) => (i <= 0 ? searchResults.length - 1 : i - 1));
        } else if (e.key === 'Enter' && activeOptionIndex >= 0) {
          e.preventDefault();
          const result = searchResults[activeOptionIndex];
          setSearchOpen(false);
          setSearchQuery('');
          setSearchResults([]);
          router.push(result.url);
        }
      }
      if (mobileOpen && e.key === 'Tab' && mobileDrawerRef.current) {
        const focusables = mobileDrawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileOpen, searchOpen, searchResults, activeOptionIndex, router]);

  // Focus search input on open
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Reset keyboard-active option whenever results or query change
  useEffect(() => {
    setActiveOptionIndex(-1);
  }, [searchResults, searchQuery]);

  const performSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
    setSearching(true);
    fetch(`${apiBase}/search?q=${encodeURIComponent(q)}`)
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

  return (
    <>
      <header
        id="site-header"
        className="bg-ink/95 border-b border-ink-border text-ink-100 sticky top-0 z-40 backdrop-blur shadow-md shadow-black/20"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0" aria-label="Sandip Thapa - Home">
            <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center font-serif-display font-bold text-sm text-ink shadow-lg group-hover:brightness-110 transition-all">
              ST
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-serif-display font-semibold text-sm tracking-tight text-ink-100 group-hover:text-gold transition-colors">
                Sandip Thapa
              </span>
              <span className="text-[10px] text-ink-400 font-medium">Law, Research &amp; Accessibility</span>
            </div>
          </Link>

          {/* Desktop Navigation (Visible ONLY on Desktop >= 1024px, Hidden on Mobile/Tablet) */}
          <nav
            className="hidden lg:flex items-center gap-1 text-[12px] font-semibold flex-1 justify-center"
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
                  className="px-3 py-2 text-ink-400 hover:text-gold hover:bg-ink-elevated rounded-lg transition-all flex items-center gap-1 whitespace-nowrap focus:ring-2 focus:ring-gold"
                  aria-haspopup={item.children ? 'true' : undefined}
                  aria-expanded={activeDropdown === item.label ? 'true' : undefined}
                >
                  {item.label}
                  {item.children && <span className="text-[10px] opacity-50 ml-0.5">▼</span>}
                </Link>

                {item.children && activeDropdown === item.label && (
                  <div
                    className="absolute left-0 top-full mt-1 w-56 bg-ink-elevated border border-ink-border rounded-xl shadow-2xl shadow-black/40 py-2 space-y-0.5 z-50"
                    role="menu"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.url}
                        className="block px-4 py-2 text-ink-400 hover:text-gold hover:bg-ink/80 text-xs transition-colors focus:ring-2 focus:ring-gold"
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
              onClick={() => {
                setSearchOpen(true);
                setMobileOpen(false);
              }}
              aria-label="Open search modal (Ctrl+K)"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-ink-elevated hover:bg-ink border border-ink-border text-ink-400 rounded-lg text-xs font-medium transition-colors focus:ring-2 focus:ring-gold"
            >
              <span>Search</span>
              <kbd className="hidden md:block px-1.5 py-0.5 bg-ink rounded text-[10px] border border-ink-border">Ctrl+K</kbd>
            </button>

            {/* Mobile Hamburger Button (Visible ONLY on Mobile/Tablet < 1024px, NEVER on Desktop) */}
            <button
              ref={hamburgerButtonRef}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              className="lg:hidden p-2 text-ink-400 hover:text-ink-100 hover:bg-ink-elevated rounded-lg transition-colors focus:ring-2 focus:ring-gold"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Rendered ONLY on Mobile/Tablet when open, NEVER on Desktop) */}
      {!isDesktop && mobileOpen && (
        <div
          id="mobile-nav-panel"
          ref={mobileDrawerRef}
          className="lg:hidden fixed top-[56px] left-0 right-0 bottom-0 bg-ink/98 backdrop-blur z-50 overflow-y-auto p-4 border-t border-ink-border"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.label} className="border-b border-ink-elevated pb-1">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.url}
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 px-4 py-3 text-ink-100 hover:text-gold hover:bg-ink-elevated rounded-xl font-bold text-sm transition-colors focus:ring-2 focus:ring-gold"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      className="px-3 py-3 text-ink-400 hover:text-gold transition-colors focus:ring-2 focus:ring-gold"
                      aria-label={`Toggle ${item.label} submenu`}
                    >
                      <span className="text-xs">{mobileExpanded === item.label ? '▲' : '▼'}</span>
                    </button>
                  )}
                </div>

                {item.children && mobileExpanded === item.label && (
                  <div className="ml-6 my-1 space-y-1 bg-ink-elevated/60 rounded-lg p-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.url}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-ink-400 hover:text-gold hover:bg-ink rounded-md text-xs font-medium transition-colors focus:ring-2 focus:ring-gold"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-ink-border mt-4">
              <a
                href="/admin/login"
                className="block text-center px-4 py-3 text-gold border border-gold/30 bg-gold/10 text-xs font-bold rounded-xl hover:bg-gold/20 transition-colors"
              >
                Backend Admin Console
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-ink/90 backdrop-blur z-50 flex items-start justify-center pt-20 px-4"
          role="dialog"
          aria-label="Site search"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div className="w-full max-w-2xl bg-ink-elevated border border-ink-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-border">
              <span className="text-ink-400 text-sm font-bold">Search</span>
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Search articles, research, publications, poems..."
                aria-label="Search the website"
                role="combobox"
                aria-expanded={searchResults.length > 0}
                aria-controls="search-results-listbox"
                aria-autocomplete="list"
                aria-activedescendant={activeOptionIndex >= 0 ? `search-option-${activeOptionIndex}` : undefined}
                className="flex-1 bg-transparent text-ink-100 text-sm placeholder:text-ink-400/70 outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-ink-400 hover:text-gold px-2 py-1 text-xs font-semibold transition-colors focus:ring-2 focus:ring-gold"
                aria-label="Close search modal"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {searching && (
                <div className="p-8 text-center text-ink-400 text-sm animate-pulse">Searching catalog...</div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-ink-400 text-sm">No results found for &quot;<strong className="text-ink-100">{searchQuery}</strong>&quot;</p>
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <ul id="search-results-listbox" role="listbox" aria-label="Search results" className="divide-y divide-ink-border/50">
                  {searchResults.map((result, index) => (
                     <li
                      key={result.id}
                      id={`search-option-${index}`}
                      role="option"
                      aria-selected={index === activeOptionIndex}
                    >
                      <Link
                        href={result.url}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                        className={`flex items-start gap-3 px-5 py-4 hover:bg-ink/60 transition-colors group ${index === activeOptionIndex ? 'bg-ink/60' : ''}`}
                      >
                        <span className="mt-0.5 px-1.5 py-0.5 bg-ink-elevated text-ink-400 text-[9px] font-bold rounded uppercase tracking-wider flex-shrink-0">
                          {result.entityType}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-ink-100 group-hover:text-gold transition-colors leading-snug">{result.title}</p>
                          {result.summary && (
                            <p className="text-xs text-ink-400 mt-0.5 line-clamp-2 leading-relaxed">{result.summary}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
