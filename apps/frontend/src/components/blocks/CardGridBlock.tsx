import React from 'react';
import { PinIcon, CalendarIcon } from '../ui/Icon';
import {
  Badge,
  Card,
  EmptyState,
  MetaItem,
  MetaRow,
  Section,
  SectionHeading,
  StretchedLink,
  slugifyId,
} from '../ui/primitives';

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
  const headingId = heading ? slugifyId(heading, 'grid') : undefined;

  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <Section labelledBy={headingId} className="space-y-7">
      {heading && <SectionHeading id={headingId} title={heading} description={description} />}

      {items.length === 0 ? (
        <EmptyState
          title="Nothing published here yet"
          description="New entries appear in this section as soon as they are published."
          icon={<span className="text-lg">◇</span>}
        />
      ) : (
        <ul className={`grid ${colClass} gap-5 list-none p-0 m-0`}>
          {items.map((item, idx) => {
            const label = item.title || item.name || 'Untitled';
            const badge = item.type || item.collection || item.role;

            return (
              <Card as="li" key={idx} interactive={!!item.url} className="edge-lit flex flex-col gap-3">
                {badge && <Badge>{badge}</Badge>}

                <h3 className="text-base font-semibold leading-snug text-ink-100 transition-colors group-hover:text-gold-text text-pretty">
                  {item.url ? <StretchedLink href={item.url}>{label}</StretchedLink> : label}
                </h3>

                {(item.summary || item.description) && (
                  <p className="line-clamp-3 text-sm leading-relaxed text-ink-400">{item.summary || item.description}</p>
                )}

                {item.quote && (
                  <blockquote className="border-l-2 border-gold pl-3 text-sm italic leading-relaxed text-ink-100/90">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                )}

                {item.citationApa && (
                  <p className="rounded-lg border border-ink-border bg-ink p-2.5 font-mono text-[10px] leading-relaxed text-ink-400">
                    <span className="font-sans font-bold uppercase tracking-wider">APA</span> {item.citationApa}
                  </p>
                )}

                <MetaRow className="mt-auto pt-1">
                  {item.publishedBs && <MetaItem emphasis>{item.publishedBs}</MetaItem>}
                  {item.publishedAd && <MetaItem>{item.publishedAd}</MetaItem>}
                  {typeof item.readingTime === 'number' && item.readingTime > 0 && (
                    <MetaItem>{item.readingTime} min read</MetaItem>
                  )}
                  {typeof item.views === 'number' && item.views > 0 && (
                    <MetaItem>{item.views.toLocaleString('en-US')} views</MetaItem>
                  )}
                  {item.timeline && <MetaItem emphasis>{item.timeline}</MetaItem>}
                  {item.location && <MetaItem icon={<PinIcon className="text-[11px]" />}>{item.location}</MetaItem>}
                  {item.date && <MetaItem icon={<CalendarIcon className="text-[11px]" />}>{item.date}</MetaItem>}
                </MetaRow>
              </Card>
            );
          })}
        </ul>
      )}
    </Section>
  );
};
