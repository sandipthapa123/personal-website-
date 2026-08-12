import React from 'react';
import { CalendarIcon, ClockIcon } from '../ui/Icon';
import { Badge, EmptyState, MetaItem, MetaRow, Section, SectionHeading, slugifyId } from '../ui/primitives';

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

export const ArticleListBlock: React.FC<ArticleListProps> = ({ heading, description, items = [] }) => {
  const headingId = heading ? slugifyId(heading, 'articles') : undefined;

  return (
    <Section labelledBy={headingId} className="space-y-7">
      {heading && <SectionHeading id={headingId} title={heading} description={description} />}

      {items.length === 0 ? (
        <EmptyState
          title="No articles published yet"
          description="Essays and articles will be listed here once they go live."
          icon={<span className="text-lg">✎</span>}
        />
      ) : (
        <ul className="m-0 list-none divide-y divide-ink-border p-0">
          {items.map((article, idx) => {
            const href = article.url || (article.slug ? `/${article.slug}` : undefined);

            return (
              <li
                key={idx}
                className="group relative -mx-4 rounded-2xl px-4 py-6 transition-colors first:pt-0 last:pb-0 hover:bg-ink-elevated/60 focus-within:bg-ink-elevated/60"
              >
                <div className="space-y-3">
                  {(article.category || (article.tags && article.tags.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {article.category && <Badge>{article.category}</Badge>}
                      {article.tags?.map((tag, i) => (
                        <Badge key={i} tone="neutral">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <h3 className="text-lg font-semibold leading-snug text-ink-100 transition-colors group-hover:text-gold-text text-pretty sm:text-xl">
                    {href ? (
                      <a href={href} className="rounded outline-offset-4 before:absolute before:inset-0 before:content-['']">
                        {article.title}
                      </a>
                    ) : (
                      article.title
                    )}
                  </h3>

                  {article.summary && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-ink-400">{article.summary}</p>
                  )}

                  <MetaRow>
                    {article.authorName && <MetaItem emphasis>{article.authorName}</MetaItem>}
                    {article.publishedBs && (
                      <MetaItem icon={<CalendarIcon className="text-[10px]" />}>{article.publishedBs}</MetaItem>
                    )}
                    {article.publishedAd && <MetaItem>({article.publishedAd})</MetaItem>}
                    {article.timeNpt && <MetaItem>{article.timeNpt}</MetaItem>}
                    {typeof article.readingTime === 'number' && article.readingTime > 0 && (
                      <MetaItem icon={<ClockIcon className="text-[10px]" />}>{article.readingTime} min read</MetaItem>
                    )}
                    {typeof article.wordCount === 'number' && article.wordCount > 0 && (
                      <MetaItem>{article.wordCount.toLocaleString('en-US')} words</MetaItem>
                    )}
                    {typeof article.views === 'number' && article.views > 0 && (
                      <MetaItem>{article.views.toLocaleString('en-US')} views</MetaItem>
                    )}
                  </MetaRow>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
};
