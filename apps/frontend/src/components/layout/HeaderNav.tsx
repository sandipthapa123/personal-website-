'use client';

import React, { useEffect, useLayoutEffect, useState, useRef, useCallback, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon, SearchIcon } from '../ui/Icon';
import { useFocusTrap } from '../../hooks/useFocusTrap';

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

/** One top-level item in the desktop nav bar: a plain link, or a disclosure button
 * that reveals a submenu. Uses the WAI-ARIA APG "disclosure navigation" pattern
 * (button + plain link list) rather than role="menu"/"menuitem", which the ARIA
 * Authoring Practices Guide recommends against for site navigation. */
function DesktopNavItem({ item, openLabel, onOpenChange }: {
  item: INavItem;
  openLabel: string | null;
  onOpenChange: (label: string | null) => void;
}) {
  const isOpen = openLabel === item.label;
  const groupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const submenuId = useId();
  const [focusFirstOnOpen, setFocusFirstOnOpen] = useState(false);

  // All hooks must run unconditionally (Rules of Hooks) — the childless-item
  // early return happens below, after every hook has been called.
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        onOpenChange(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onOpenChange]);

  // Runs after React has committed the opened submenu to the DOM — more reliable
  // than trying to focus inside the same keydown handler that triggers the open.
  useEffect(() => {
    if (isOpen && focusFirstOnOpen) {
      groupRef.current?.querySelector<HTMLElement>('a')?.focus();
      setFocusFirstOnOpen(false);
    }
  }, [isOpen, focusFirstOnOpen]);

  if (!item.children) {
    return (
      <Link
        href={item.url}
        className="px-3 py-2 text-ink-400 hover:text-gold-text hover:bg-ink-elevated rounded-lg transition-all whitespace-nowrap"
      >
        {item.label}
      </Link>
    );
  }

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      setFocusFirstOnOpen(true);
      onOpenChange(item.label);
    } else if (e.key === 'Escape' && isOpen) {
      onOpenChange(null);
    }
  };

  const handleSubmenuKeyDown = (e: React.KeyboardEvent) => {
    const links = Array.from(groupRef.current?.querySelectorAll<HTMLElement>('a') ?? []);
    const currentIndex = links.indexOf(document.activeElement as HTMLElement);

    if (e.key === 'Escape') {
      e.preventDefault();
      onOpenChange(null);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      links[(currentIndex + 1) % links.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      links[(currentIndex - 1 + links.length) % links.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      links[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      links[links.length - 1]?.focus();
    } else if (e.key === 'Tab' && !e.shiftKey && currentIndex === links.length - 1) {
      onOpenChange(null);
    }
  };

  return (
    <div ref={groupRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(isOpen ? null : item.label)}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-controls={submenuId}
        className="px-3 py-2 text-ink-400 hover:text-gold-text hover:bg-ink-elevated rounded-lg transition-all flex items-center gap-1 whitespace-nowrap"
      >
        {item.label}
        <ChevronDownIcon
          className={`text-[10px] opacity-60 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id={submenuId}
          className="absolute left-0 top-full mt-1 w-56 bg-ink-elevated border border-ink-border rounded-xl shadow-2xl shadow-black/20 py-2 space-y-0.5 z-50"
          onKeyDown={handleSubmenuKeyDown}
        >
          {item.children.map((child) => (
            <Link
              key={child.label}
              href={child.url}
              onClick={() => onOpenChange(null)}
              className="block px-4 py-2 text-ink-400 hover:text-gold-text hover:bg-ink/80 text-xs transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * "Priority+" navigation sizing.
 *
 * The CMS supplies 13 top-level entries (~1040px of links), which cannot fit
 * beside the brand and the search control on a normal laptop — the bar used to
 * simply overflow and force the whole page to scroll horizontally. This measures
 * the real available width and reports how many entries fit, so the remainder
 * can be moved into a "More" menu instead of overflowing.
 *
 * Intrinsic item widths are captured once, on the first pass while every item is
 * still rendered, because an item that has been moved into the overflow menu can
 * no longer be measured in place.
 */
function usePriorityNav(itemCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widthsRef = useRef<number[] | null>(null);
  const [visibleCount, setVisibleCount] = useState(itemCount);

  // useLayoutEffect avoids a visible reflow flash, but React warns when it runs
  // during server rendering — fall back to useEffect there.
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const MORE_BUTTON_WIDTH = 96;

    // The menu is replaced once the CMS navigation resolves (the bundled default
    // has more entries than the live menu), so cached widths from the previous
    // menu must be discarded or the split is computed against the wrong items.
    widthsRef.current = null;
    setVisibleCount(itemCount);

    const measure = () => {
      if (!widthsRef.current) {
        const measured = Array.from(el.querySelectorAll<HTMLElement>('[data-nav-item]'));
        if (measured.length !== itemCount) return;
        // +4px accounts for the flex gap between entries.
        widthsRef.current = measured.map((node) => node.getBoundingClientRect().width + 4);
      }

      const widths = widthsRef.current;
      const available = el.getBoundingClientRect().width;

      let used = 0;
      let fit = 0;
      for (const width of widths) {
        if (used + width > available) break;
        used += width;
        fit++;
      }

      // Anything hidden needs the "More" trigger to remain reachable, so make
      // room for it by giving back entries until it also fits.
      if (fit < widths.length) {
        while (fit > 0 && used + MORE_BUTTON_WIDTH > available) {
          fit--;
          used -= widths[fit];
        }
      }

      setVisibleCount(fit);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [itemCount]);

  return { containerRef, visibleCount };
}

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
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusTrap({ active: mobileOpen, containerRef: mobileDrawerRef, onClose: () => setMobileOpen(false), initialFocusRef: hamburgerButtonRef });
  useFocusTrap({ active: searchOpen, containerRef: searchModalRef, onClose: () => setSearchOpen(false), initialFocusRef: searchInputRef });

  const { containerRef: navContainerRef, visibleCount } = usePriorityNav(navItems.length);
  const visibleNavItems = navItems.slice(0, visibleCount);
  const hiddenNavItems = navItems.slice(visibleCount);

  // Collapsed entries keep their own children, flattened one level so a section
  // and its sub-pages both stay reachable from the overflow menu.
  const overflowNavItem: INavItem | null = hiddenNavItems.length
    ? {
        label: 'More',
        url: '#',
        children: hiddenNavItems.flatMap((item) =>
          item.children?.length ? [{ label: item.label, url: item.url }, ...item.children] : [{ label: item.label, url: item.url }],
        ),
      }
    : null;

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

  // Global Ctrl/Cmd+K shortcut to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setMobileOpen(false);
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
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileOpen, searchOpen, searchResults, activeOptionIndex, router]);

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

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <>
      <header
        id="site-header"
        className="bg-ink/95 border-b border-ink-border text-ink-100 sticky top-0 z-40 backdrop-blur shadow-sm shadow-black/5"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0" aria-label="Sandip Thapa - Home">
            <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center font-serif-display font-bold text-sm text-onGold shadow-lg group-hover:brightness-110 transition-all">
              ST
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-serif-display font-semibold text-sm tracking-tight text-ink-100 group-hover:text-gold-text transition-colors">
                Sandip Thapa
              </span>
              <span className="text-[10px] text-ink-400 font-medium">Law, Research &amp; Accessibility</span>
            </div>
          </Link>

          {/* Desktop Navigation (Visible ONLY on Desktop >= 1024px, Hidden on Mobile/Tablet).
              Entries that do not fit the measured width collapse into a "More" menu
              rather than overflowing the header. */}
          <nav
            ref={navContainerRef}
            className="hidden lg:flex items-center gap-1 text-[12px] font-semibold flex-1 min-w-0 justify-center"
            aria-label="Main navigation"
            id="main-nav"
          >
            {visibleNavItems.map((item) => (
              <span key={item.label} data-nav-item className="flex-shrink-0">
                <DesktopNavItem item={item} openLabel={activeDropdown} onOpenChange={setActiveDropdown} />
              </span>
            ))}

            {overflowNavItem && (
              <DesktopNavItem
                key="more-menu"
                item={overflowNavItem}
                openLabel={activeDropdown}
                onOpenChange={setActiveDropdown}
              />
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Search button */}
            <button
              ref={searchButtonRef}
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setMobileOpen(false);
              }}
              aria-label="Open search (Ctrl+K)"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-ink-elevated hover:bg-ink border border-ink-border text-ink-400 rounded-lg text-xs font-medium transition-colors"
            >
              <SearchIcon className="text-xs" />
              <span>Search</span>
              <kbd className="hidden md:block px-1.5 py-0.5 bg-ink rounded text-[10px] border border-ink-border">Ctrl+K</kbd>
            </button>

            {/* Mobile Hamburger Button (Visible ONLY on Mobile/Tablet < 1024px, NEVER on Desktop) */}
            <button
              ref={hamburgerButtonRef}
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              className="lg:hidden p-2 text-ink-400 hover:text-ink-100 hover:bg-ink-elevated rounded-lg transition-colors"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
          aria-label="Mobile navigation menu"
        >
          <nav aria-label="Mobile navigation">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const submenuId = `mobile-submenu-${item.label.replace(/\s+/g, '-').toLowerCase()}`;
                const expanded = mobileExpanded === item.label;
                return (
                  <li key={item.label} className="border-b border-ink-elevated pb-1">
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.url}
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 px-4 py-3 text-ink-100 hover:text-gold-text hover:bg-ink-elevated rounded-xl font-bold text-sm transition-colors"
                      >
                        {item.label}
                      </Link>
                      {item.children && (
                        <button
                          type="button"
                          onClick={() => setMobileExpanded(expanded ? null : item.label)}
                          className="px-3 py-3 text-ink-400 hover:text-gold-text transition-colors"
                          aria-expanded={expanded}
                          aria-controls={submenuId}
                          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.label} submenu`}
                        >
                          <ChevronDownIcon
                            className={`text-xs transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                    </div>

                    {item.children && (
                      <ul
                        id={submenuId}
                        hidden={!expanded}
                        className="ml-6 my-1 space-y-1 bg-ink-elevated/60 rounded-lg p-2"
                      >
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <Link
                              href={child.url}
                              onClick={() => setMobileOpen(false)}
                              className="block px-3 py-2 text-ink-400 hover:text-gold-text hover:bg-ink rounded-md text-xs font-medium transition-colors"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-ink/70 backdrop-blur z-50 flex items-start justify-center pt-20 px-4"
          role="dialog"
          aria-label="Site search"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSearch();
          }}
        >
          <div ref={searchModalRef} className="w-full max-w-2xl bg-ink-elevated border border-ink-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-border">
              <label htmlFor="site-search-input" className="text-ink-400 text-sm font-bold">
                Search
              </label>
              <input
                id="site-search-input"
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Search articles, research, publications, poems..."
                role="combobox"
                aria-expanded={searchResults.length > 0}
                aria-controls="search-results-listbox"
                aria-autocomplete="list"
                aria-activedescendant={activeOptionIndex >= 0 ? `search-option-${activeOptionIndex}` : undefined}
                className="flex-1 bg-transparent text-ink-100 text-sm placeholder:text-ink-400/70 outline-none"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="text-ink-400 hover:text-gold-text px-2 py-1 text-xs font-semibold transition-colors"
              >
                Close (Esc)
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {searching && (
                <div className="p-8 text-center text-ink-400 text-sm animate-pulse motion-reduce:animate-none">Searching catalog...</div>
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
                        onClick={closeSearch}
                        className={`flex items-start gap-3 px-5 py-4 hover:bg-ink/60 transition-colors group ${index === activeOptionIndex ? 'bg-ink/60' : ''}`}
                      >
                        <span className="mt-0.5 px-1.5 py-0.5 bg-ink-elevated text-ink-400 text-[9px] font-bold rounded uppercase tracking-wider flex-shrink-0">
                          {result.entityType}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-ink-100 group-hover:text-gold-text transition-colors leading-snug">{result.title}</p>
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
