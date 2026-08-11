import React from 'react';
import { formatDualCalendarDate } from '@cms/utilities';
import { EyeIcon, UsersIcon } from '../ui/Icon';

export interface ContentMetadataBarProps {
  publishedAtUtc: string;
  authorName?: string;
  categoryName?: string;
  tags?: string[];
  readingTimeMinutes?: number;
  viewCount?: number;
  uniqueVisitorsCount?: number;
}

export const ContentMetadataBar: React.FC<ContentMetadataBarProps> = ({
  publishedAtUtc,
  authorName = 'Sandip Thapa',
  categoryName = 'Articles & Research',
  tags = ['Law', 'Disability Rights', 'Technology'],
  readingTimeMinutes = 7,
  viewCount = 15342,
  uniqueVisitorsCount = 8921,
}) => {
  const dualDates = formatDualCalendarDate(publishedAtUtc || new Date().toISOString());

  return (
    <div className="bg-ink-elevated border border-ink-border rounded-xl p-6 my-6 text-sm text-ink-400 space-y-4 shadow-sm shadow-black/10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-400/70">Author</span>
          <span className="font-medium text-ink-100">{authorName}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-400/70">Category</span>
          <span className="font-medium text-ink-100">{categoryName}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-400/70">Reading Time</span>
          <span className="font-medium text-ink-100">{readingTimeMinutes} min read</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-400/70">Engagement</span>
          <span className="font-medium text-ink-100 inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><EyeIcon className="text-xs text-gold" /> {viewCount.toLocaleString('en-US')}</span>
            <span className="inline-flex items-center gap-1"><UsersIcon className="text-xs text-gold" /> {uniqueVisitorsCount.toLocaleString('en-US')}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-400/70">Published (BS)</span>
          <span className="font-semibold text-gold">{dualDates.bsFormatted}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-400/70">Published (AD)</span>
          <span className="font-medium text-ink-100">{dualDates.adFormatted}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-400/70">Nepal Time (NPT)</span>
          <span className="font-medium text-ink-100">{dualDates.nptTimeFormatted}</span>
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400/70 mr-2">Tags:</span>
          {tags.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 text-xs font-medium bg-gold/10 text-gold rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
