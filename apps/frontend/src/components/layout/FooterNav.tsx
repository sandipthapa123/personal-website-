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
}

export function FooterNav() {
  const [aboutText, setAboutText] = useState('Sandip Thapa - Legal Scholar, Researcher & Accessibility Practitioner');
  const [columns, setColumns] = useState<IFooterColumn[]>([]);
  const [socialMedia, setSocialMedia] = useState<ISocialLink[]>([]);
  const [copyright, setCopyright] = useState('© 2083 BS / 2026 AD Sandip Thapa');

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/navigation/footer')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          if (data.aboutText) setAboutText(data.aboutText);
          if (data.columns) setColumns(data.columns);
          if (data.socialMedia) setSocialMedia(data.socialMedia);
          if (data.copyright) setCopyright(data.copyright);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center font-black text-sm text-white">
                ST
              </div>
              <span className="font-bold text-white text-sm">Sandip Thapa</span>
            </div>
            <p className="text-slate-400 leading-relaxed">{aboutText}</p>
            <div className="pt-2 text-[11px] text-sky-400 font-semibold">
              Timezone: Nepal Standard Time (NPT, UTC+05:45)
            </div>
          </div>

          {/* Dynamic Footer Columns */}
          {columns.map((col) => (
            <div key={col.title} className="space-y-3">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.url} className="hover:text-sky-300 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Social & Copyright */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>{copyright}</div>

          <div className="flex items-center gap-4">
            {socialMedia.map((s) => (
              <a key={s.platform} href={s.url} target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors font-semibold">
                {s.platform}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
