'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface IFooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

interface ISocialLink {
  platform: string;
  url: string;
  icon?: string;
}

const PLATFORM_ICONS: Record<string, string> = {
  ORCID: '🔬',
  'Google Scholar': '🎓',
  LinkedIn: '💼',
  GitHub: '💻',
  Twitter: '🐦',
  ResearchGate: '🔭',
  Academia: '📖',
};

const DEFAULT_COLUMNS: IFooterColumn[] = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Biography', url: '/about/biography' },
      { label: 'Education & Credentials', url: '/about/education' },
      { label: 'Curriculum Vitae (CV)', url: '/about/resume' },
      { label: 'Legal & Accessibility Consulting', url: '/services' },
    ],
  },
  {
    title: 'Recent Content',
    links: [
      { label: 'All Articles', url: '/articles' },
      { label: 'Research Projects', url: '/research' },
      { label: 'Publications & Citation Index', url: '/publications' },
      { label: 'Poetry & Literature', url: '/poems' },
    ],
  },
  {
    title: 'Legal & Accessibility',
    links: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Use', url: '/terms' },
      { label: 'Accessibility Statement (WCAG 2.2 AAA)', url: '/accessibility-statement' },
      { label: 'RSS Feed', url: '/rss.xml' },
      { label: 'Sitemap', url: '/sitemap.xml' },
    ],
  },
];

const DEFAULT_SOCIAL: ISocialLink[] = [
  { platform: 'ORCID', url: 'https://orcid.org' },
  { platform: 'Google Scholar', url: 'https://scholar.google.com' },
  { platform: 'LinkedIn', url: 'https://linkedin.com' },
  { platform: 'GitHub', url: 'https://github.com/sandipthapa123' },
];

export function FooterNav() {
  const [aboutText, setAboutText] = useState(
    'Sandip Thapa — Legal Scholar, Human Rights Advocate, and Disability Accessibility Specialist based in Nepal. Advancing evidence-based policy, inclusive design, and academic publishing.',
  );
  const [columns, setColumns] = useState<IFooterColumn[]>(DEFAULT_COLUMNS);
  const [socialMedia, setSocialMedia] = useState<ISocialLink[]>(DEFAULT_SOCIAL);
  const [copyright, setCopyright] = useState('© 2083 BS / 2026 AD Sandip Thapa. All rights reserved.');

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
    fetch(`${apiBase}/navigation/footer`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.data) {
          const d = data.data;
          if (d.aboutText) setAboutText(d.aboutText);
          if (Array.isArray(d.columns) && d.columns.length > 0) setColumns(d.columns);
          if (Array.isArray(d.socialMedia) && d.socialMedia.length > 0) setSocialMedia(d.socialMedia);
          if (d.copyright) setCopyright(d.copyright);
        } else if (data) {
          if (data.aboutText) setAboutText(data.aboutText);
          if (Array.isArray(data.columns) && data.columns.length > 0) setColumns(data.columns);
          if (Array.isArray(data.socialMedia) && data.socialMedia.length > 0) setSocialMedia(data.socialMedia);
          if (data.copyright) setCopyright(data.copyright);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer
      className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs"
      role="contentinfo"
      id="site-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand / About Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center font-black text-sm text-white shadow">
                ST
              </div>
              <span className="font-extrabold text-white text-sm">Sandip Thapa</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[12px]">{aboutText}</p>
            <div className="space-y-1 pt-1">
              <div className="text-[11px] text-sky-400/80 font-semibold">
                🕐 Nepal Standard Time (NPT, UTC+05:45)
              </div>
              <div className="text-[11px] text-slate-500">
                Kathmandu, Nepal 🇳🇵
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2 pt-1">
              {socialMedia.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  title={s.platform}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-800 rounded-lg transition-all text-[10px] font-semibold text-slate-300 hover:text-sky-300"
                >
                  <span>{PLATFORM_ICONS[s.platform] || '🔗'}</span>
                  <span className="hidden sm:inline">{s.platform}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Backend-Driven Footer Columns */}
          {columns.map((col) => (
            <div key={col.title} className="space-y-4">
              <h4 className="font-extrabold text-white uppercase tracking-widest text-[10px]">{col.title}</h4>
              <nav aria-label={`Footer: ${col.title}`}>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.url}
                        className="text-slate-400 hover:text-sky-300 transition-colors leading-snug block text-[12px]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600 text-[11px]">
          <p>{copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
            <Link href="/accessibility-statement" className="hover:text-slate-400 transition-colors">
              Accessibility
            </Link>
            <a
              href="/admin/login"
              className="hover:text-sky-400 transition-colors font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
