'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface INavItem {
  label: string;
  url: string;
  children?: { label: string; url: string }[];
}

export function HeaderNav() {
  const [navItems, setNavItems] = useState<INavItem[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/navigation/main')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.items) setNavItems(data.items);
      })
      .catch(() => {
        // Fallback default navigation if backend loading
        setNavItems([
          { label: 'Home', url: '/' },
          { label: 'About', url: '/about' },
          { label: 'Articles', url: '/articles' },
          { label: 'Research', url: '/research' },
          { label: 'Publications', url: '/publications' },
          { label: 'Poems', url: '/poems' },
          { label: 'Projects', url: '/projects' },
          { label: 'Media', url: '/media' },
          { label: 'Services', url: '/services' },
          { label: 'Contact', url: '/contact' },
        ]);
      });
  }, []);

  return (
    <header className="bg-slate-950/90 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
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

        {/* Dynamic Backend-Driven Nav Menu */}
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
                className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-all flex items-center gap-1"
              >
                {item.label}
                {item.children && <span className="text-[10px] opacity-60">▾</span>}
              </Link>

              {item.children && activeDropdown === item.label && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 space-y-1 z-50">
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

        {/* Right Actions */}
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

          <Link
            href="/admin/login"
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
