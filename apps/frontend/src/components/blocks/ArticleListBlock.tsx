import React from 'react';
import { CalendarIcon, ClockIcon } from '../ui/Icon';

export interface ArticleListProps {
  heading?: string;
  description?: string;
  items?: Array<{
    title: string;
    summary?: string;
    slug?: string;
    url?: string;
    publishedBs?: string;
    publishedAd?: string;
    timeNpt?: string;
    readingTime?: number;
    wordCount?: number;
    views?: number;
    authorName?: string;
    tags?: string[];
    category?: string;
  }>;
}

export const ArticleListBlock: React.FC<ArticleListProps> = ({ heading, description, items = [] }) => (
  <section className="space-y-6">
    {(heading || description) && (
      <div className="space-y-2">
        {heading && <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-ink-100 tracking-tight">{heading}</h2>}
        {description && <p className="text-sm text-ink-400">{description}</p>}
      </div>
    )}
    <div className="divide-y divide-ink-border">
      {items.map((article, idx) => (
        <article
          key={idx}
          className="group py-5 first:pt-0 last:pb-0 space-y-3"
        >
          {/* Category/Tags */}
          {(article.category || (article.tags && article.tags.length > 0)) && (
            <div className="flex items-center gap-2 flex-wrap">
              {article.category && (
                <span className="px-2 py-0.5 bg-gold/10 text-gold text-[10px] font-bold rounded uppercase tracking-wider">
                  {article.category}
                </span>
              )}
              {article.tags?.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-ink-elevated text-ink-400 text-[10px] rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-lg font-semibold text-ink-100 group-hover:text-gold transition-colors leading-snug">
            {article.url || article.slug ? (
              <a
                href={article.url || `/${article.slug}`}
                className="focus:outline-none focus:ring-2 focus:ring-gold rounded"
              >
                {article.title}
              </a>
            ) : (
              article.title
            )}
          </h3>

          {article.summary && (
            <p className="text-sm text-ink-400 leading-relaxed line-clamp-2">{article.summary}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-400/80 font-medium">
            {article.authorName && (
              <span className="text-ink-400 font-semibold">{article.authorName}</span>
            )}
            {article.publishedBs && (
              <span className="inline-flex items-center gap-1"><CalendarIcon className="text-[10px]" /> {article.publishedBs}</span>
            )}
            {article.publishedAd && <span>({article.publishedAd})</span>}
            {article.timeNpt && <span>{article.timeNpt}</span>}
            {article.readingTime && (
              <span className="inline-flex items-center gap-1"><ClockIcon className="text-[10px]" /> {article.readingTime} min read</span>
            )}
            {article.wordCount && <span>{article.wordCount.toLocaleString('en-US')} words</span>}
            {article.views && (
              <span className="text-ink-400/60">{article.views.toLocaleString('en-US')} views</span>
            )}
          </div>

        </article>
      ))}
    </div>
  </section>
);
