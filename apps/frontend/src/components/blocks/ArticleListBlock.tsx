import React from 'react';

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
        {heading && <h2 className="text-2xl font-extrabold text-white tracking-tight">{heading}</h2>}
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
    )}
    <div className="divide-y divide-slate-800">
      {items.map((article, idx) => (
        <article
          key={idx}
          className="group py-5 first:pt-0 last:pb-0 space-y-3"
        >
          {/* Category/Tags */}
          {(article.category || (article.tags && article.tags.length > 0)) && (
            <div className="flex items-center gap-2 flex-wrap">
              {article.category && (
                <span className="px-2 py-0.5 bg-sky-500/15 text-sky-300 text-[10px] font-bold rounded uppercase tracking-wider">
                  {article.category}
                </span>
              )}
              {article.tags?.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
            {article.url || article.slug ? (
              <a href={article.url || `/${article.slug}`}>{article.title}</a>
            ) : (
              article.title
            )}
          </h3>

          {article.summary && (
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{article.summary}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
            {article.authorName && (
              <span className="text-slate-400 font-semibold">{article.authorName}</span>
            )}
            {article.publishedBs && <span>🗓 {article.publishedBs}</span>}
            {article.publishedAd && <span>({article.publishedAd})</span>}
            {article.timeNpt && <span>{article.timeNpt}</span>}
            {article.readingTime && <span>⏱ {article.readingTime} min read</span>}
            {article.wordCount && <span>{article.wordCount.toLocaleString()} words</span>}
            {article.views && (
              <span className="text-slate-600">{article.views.toLocaleString()} views</span>
            )}
          </div>

          {(article.url || article.slug) && (
            <a
              href={article.url || `/${article.slug}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
            >
              Read full article →
            </a>
          )}
        </article>
      ))}
    </div>
  </section>
);
