import React from 'react';
import { PinIcon, CalendarIcon } from '../ui/Icon';

export interface CardGridProps {
  heading?: string;
  description?: string;
  items?: Array<{
    title?: string;
    name?: string;
    summary?: string;
    description?: string;
    quote?: string;
    role?: string;
    collection?: string;
    type?: string;
    location?: string;
    date?: string;
    publishedBs?: string;
    publishedAd?: string;
    timeNpt?: string;
    readingTime?: number;
    wordCount?: number;
    views?: number;
    citationApa?: string;
    timeline?: string;
    url?: string;
  }>;
  columns?: 1 | 2 | 3 | 4;
}

export const CardGridBlock: React.FC<CardGridProps> = ({ heading, description, items = [], columns = 2 }) => {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <section className="space-y-6">
      {heading && (
        <div className="space-y-2">
          <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-ink-100 tracking-tight">{heading}</h2>
          {description && <p className="text-sm text-ink-400">{description}</p>}
        </div>
      )}
      <div className={`grid ${colClass} gap-4`}>
        {items.map((item, idx) => (
          <article
            key={idx}
            className="group p-5 bg-ink-elevated border border-ink-border rounded-2xl space-y-3 hover:border-gold/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer"
          >
            {/* Type / Collection Badge */}
            {(item.type || item.collection || item.role) && (
              <span className="inline-block px-2.5 py-0.5 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-wider rounded">
                {item.type || item.collection || item.role}
              </span>
            )}

            <h3 className="font-semibold text-ink-100 group-hover:text-gold transition-colors text-sm leading-snug">
              {item.url ? (
                <a
                  href={item.url}
                  className="focus:outline-none focus:ring-2 focus:ring-gold rounded"
                >
                  {item.title || item.name}
                </a>
              ) : (
                item.title || item.name
              )}
            </h3>

            {(item.summary || item.description) && (
              <p className="text-xs text-ink-400 leading-relaxed line-clamp-3">
                {item.summary || item.description}
              </p>
            )}

            {item.quote && (
              <blockquote className="text-xs italic text-ink-100/90 border-l-2 border-gold pl-3 leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
            )}

            {item.citationApa && (
              <div className="p-2.5 bg-ink rounded-lg text-[10px] font-mono text-ink-400 border border-ink-border leading-relaxed">
                APA: {item.citationApa}
              </div>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
              {item.publishedBs && (
                <span className="text-[10px] text-gold font-semibold">
                  {item.publishedBs}
                </span>
              )}
              {item.publishedAd && (
                <span className="text-[10px] text-ink-400">
                  {item.publishedAd}
                </span>
              )}
              {item.readingTime && (
                <span className="text-[10px] text-ink-400">
                  {item.readingTime} min read
                </span>
              )}
              {item.views && (
                <span className="text-[10px] text-ink-400/70">
                  {item.views.toLocaleString('en-US')} views
                </span>
              )}
              {item.timeline && (
                <span className="text-[10px] text-gold font-medium">
                  {item.timeline}
                </span>
              )}
              {item.location && (
                <span className="inline-flex items-center gap-1 text-[10px] text-ink-400">
                  <PinIcon className="text-[11px]" /> {item.location}
                </span>
              )}
              {item.date && (
                <span className="inline-flex items-center gap-1 text-[10px] text-ink-400">
                  <CalendarIcon className="text-[11px]" /> {item.date}
                </span>
              )}
            </div>

          </article>
        ))}
      </div>
    </section>
  );
};
