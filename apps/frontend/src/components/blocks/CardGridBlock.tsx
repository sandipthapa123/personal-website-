import React from 'react';

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
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{heading}</h2>
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
      )}
      <div className={`grid ${colClass} gap-4`}>
        {items.map((item, idx) => (
          <article
            key={idx}
            className="group p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-sky-800/50 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer"
          >
            {/* Type / Collection Badge */}
            {(item.type || item.collection || item.role) && (
              <span className="inline-block px-2.5 py-0.5 bg-sky-500/15 text-sky-300 text-[10px] font-bold uppercase tracking-wider rounded">
                {item.type || item.collection || item.role}
              </span>
            )}

            <h3 className="font-bold text-slate-100 group-hover:text-sky-300 transition-colors text-sm leading-snug">
              {item.title || item.name}
            </h3>

            {(item.summary || item.description) && (
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {item.summary || item.description}
              </p>
            )}

            {item.quote && (
              <blockquote className="text-xs italic text-slate-300 border-l-2 border-sky-600 pl-3 leading-relaxed">
                "{item.quote}"
              </blockquote>
            )}

            {item.citationApa && (
              <div className="p-2.5 bg-slate-950 rounded-lg text-[10px] font-mono text-slate-500 border border-slate-800 leading-relaxed">
                APA: {item.citationApa}
              </div>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
              {item.publishedBs && (
                <span className="text-[10px] text-sky-500 font-semibold">
                  {item.publishedBs}
                </span>
              )}
              {item.publishedAd && (
                <span className="text-[10px] text-slate-500">
                  {item.publishedAd}
                </span>
              )}
              {item.readingTime && (
                <span className="text-[10px] text-slate-500">
                  {item.readingTime} min read
                </span>
              )}
              {item.views && (
                <span className="text-[10px] text-slate-600">
                  {item.views.toLocaleString()} views
                </span>
              )}
              {item.timeline && (
                <span className="text-[10px] text-sky-400 font-medium">
                  {item.timeline}
                </span>
              )}
              {item.location && (
                <span className="text-[10px] text-slate-500">
                  📍 {item.location}
                </span>
              )}
              {item.date && (
                <span className="text-[10px] text-slate-500">
                  🗓 {item.date}
                </span>
              )}
            </div>

            {item.url && (
              <a
                href={item.url}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors mt-1"
              >
                Read more →
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
