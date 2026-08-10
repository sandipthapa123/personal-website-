import React from 'react';
import { formatDualCalendarDate } from '@cms/utilities';

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
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 my-6 text-sm text-slate-700 dark:text-slate-300 space-y-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Author</span>
          <span className="font-medium text-slate-900 dark:text-white">{authorName}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Category</span>
          <span className="font-medium text-slate-900 dark:text-white">{categoryName}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Reading Time</span>
          <span className="font-medium text-slate-900 dark:text-white">{readingTimeMinutes} min read</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Engagement</span>
          <span className="font-medium text-slate-900 dark:text-white">
            👁️ {viewCount.toLocaleString('en-US')} views · 👤 {uniqueVisitorsCount.toLocaleString('en-US')} unique
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Published (BS)</span>
          <span className="font-semibold text-sky-600 dark:text-sky-400">{dualDates.bsFormatted}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Published (AD)</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{dualDates.adFormatted}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Nepal Time (NPT)</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{dualDates.nptTimeFormatted}</span>
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">Tags:</span>
          {tags.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
