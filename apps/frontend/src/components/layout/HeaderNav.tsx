'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface INavItem {
  label: string;
  url: string;
  children?: { label: string; url: string }[];
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
  const [navItems, setNavItems] = useState<INavItem[]>(DEFAULT_MAIN_NAVIGATION);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

  return (
    <header className="bg-slate-950/95 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg group-hover:bg-sky-500 transition-colors">
            ST
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-sky-300 transition-colors">
              Sandip Thapa
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Law, Research & Accessibility</span>
          </div>
        </Link>

        {/* Dynamic Backend-Driven Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={item.url}
                className="px-2.5 py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-all flex items-center gap-1"
              >
                {item.label}
                {item.children && <span className="text-[10px] opacity-60">▾</span>}
              </Link>

              {item.children && activeDropdown === item.label && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 space-y-1 z-50">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.url}
                      className="block px-4 py-2 text-slate-300 hover:text-sky-300 hover:bg-slate-800/80 text-xs transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Search Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
              window.dispatchEvent(event);
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <span>🔍 Search</span>
            <kbd className="px-1.5 py-0.5 bg-slate-950 rounded text-[10px] border border-slate-800">Ctrl K</kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
