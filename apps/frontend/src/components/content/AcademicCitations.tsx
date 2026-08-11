'use client';

import React, { useState } from 'react';
import { ACCESSIBILITY_CONSTANTS } from '@cms/accessibility';
import { CapIcon, CheckIcon } from '../ui/Icon';

export interface AcademicCitationsProps {
  title: string;
  authors?: string[];
  journal?: string;
  year?: number;
  doi?: string;
}

export const AcademicCitations: React.FC<AcademicCitationsProps> = ({
  title,
  authors = ['Sandip Thapa'],
  journal = 'Journal of Enterprise Architecture & Public Law',
  year = 2026,
  doi = '10.1000/182',
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const authorStr = authors.join(', ');

  const citations = {
    APA: `${authorStr} (${year}). ${title}. ${journal}, DOI: ${doi}.`,
    MLA: `${authorStr}. "${title}." ${journal}, ${year}, doi:${doi}.`,
    Chicago: `${authorStr}. "${title}." ${journal} (${year}). https://doi.org/${doi}.`,
    OSCOLA: `${authorStr}, '${title}' (${year}) ${journal}.`,
    Bluebook: `${authorStr}, ${title}, ${year} ${journal}.`,
    BibTeX: `@article{thapa${year},\n  author = {${authorStr}},\n  title = {${title}},\n  journal = {${journal}},\n  year = {${year}},\n  doi = {${doi}}\n}`,
  };

  const handleCopy = (formatName: keyof typeof citations) => {
    navigator.clipboard.writeText(citations[formatName]);
    setCopiedFormat(formatName);

    const announcer = document.getElementById(ACCESSIBILITY_CONSTANTS.LIVE_ANNOUNCER_ID);
    if (announcer) {
      announcer.textContent = `${formatName} citation copied to clipboard!`;
    }

    setTimeout(() => setCopiedFormat(null), 3000);
  };

  return (
    <section className="p-6 bg-ink-elevated border border-ink-border rounded-2xl my-8 space-y-4">
      <h3 className="font-serif-display text-base font-semibold text-ink-100 flex items-center gap-2">
        <CapIcon className="text-gold text-lg" /> Citation Generator &amp; Academic Export
      </h3>
      <div className="space-y-3 text-xs sm:text-sm">
        {(Object.keys(citations) as Array<keyof typeof citations>).map((fmt) => (
          <div key={fmt} className="p-3 bg-ink border border-ink-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-gold mr-2">{fmt}:</span>
              <span className="font-mono text-ink-400">{citations[fmt]}</span>
            </div>
            <button
              onClick={() => handleCopy(fmt)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold text-ink rounded font-medium hover:brightness-110 transition-all self-start sm:self-auto flex-shrink-0"
            >
              {copiedFormat === fmt ? (<><CheckIcon className="text-xs" /> Copied</>) : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
