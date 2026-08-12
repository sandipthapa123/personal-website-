'use client';

import React, { useState, useEffect } from 'react';
import { BookIcon } from '../ui/Icon';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface TableOfContentsProps {
  contentSelector?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ contentSelector = '#main-content-landmark' }) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);

  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const headingNodes = container.querySelectorAll('h1, h2, h3');
    const items: TocItem[] = [];

    headingNodes.forEach((node, idx) => {
      if (!node.id) {
        node.id = `toc-heading-${idx}`;
      }
      items.push({
        id: node.id,
        text: node.textContent || '',
        level: parseInt(node.tagName.substring(1), 10),
      });
    });

    setHeadings(items);
  }, [contentSelector]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of Contents" className="p-4 bg-ink-elevated border border-ink-border rounded-xl my-6 text-sm">
      <h3 className="font-bold text-ink-100 uppercase text-xs tracking-wider mb-3 flex items-center gap-2">
        <BookIcon className="text-gold-text" /> Table of Contents
      </h3>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 1) * 0.75}rem` }}>
            <a
              href={`#${h.id}`}
              className="text-ink-400 hover:text-gold-text hover:underline transition-all block text-xs sm:text-sm"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
