'use client';

import React, { useState } from 'react';
import { ACCESSIBILITY_CONSTANTS } from '@cms/accessibility';

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
    <section className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl my-8 space-y-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        🎓 Citation Generator & Academic Export
      </h3>
      <div className="space-y-3 text-xs sm:text-sm">
        {(Object.keys(citations) as Array<keyof typeof citations>).map((fmt) => (
          <div key={fmt} className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-sky-600 dark:text-sky-400 mr-2">{fmt}:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{citations[fmt]}</span>
            </div>
            <button
              onClick={() => handleCopy(fmt)}
              className="px-3 py-1 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded font-medium hover:opacity-90 transition-opacity self-start sm:self-auto flex-shrink-0"
            >
              {copiedFormat === fmt ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
