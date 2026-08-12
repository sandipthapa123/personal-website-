import React from 'react';
import { EmptyState, Section, SectionHeading, slugifyId } from '../ui/primitives';

export interface TimelineItem {
  year: string;
  role: string;
  organization: string;
  description: string;
}

export interface TimelineBlockProps {
  title?: string;
  items?: TimelineItem[];
}

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  title = 'Career & Experience',
  // No invented default entries: this block used to fall back to placeholder
  // résumé rows ("Senior Software Architect at Enterprise Solutions") that were
  // rendered to real visitors whenever the CMS supplied nothing.
  items = [],
}) => {
  const headingId = slugifyId(title || 'timeline', 'timeline');

  return (
    <Section labelledBy={headingId} className="space-y-8">
      {title && <SectionHeading id={headingId} title={title} />}

      {items.length === 0 ? (
        <EmptyState
          title="No timeline entries yet"
          description="Roles and milestones will appear here once published."
          icon={<span className="text-lg">◷</span>}
        />
      ) : (
        <ol className="relative m-0 list-none space-y-9 border-l-2 border-gold/30 p-0 pl-8">
          {items.map((item, idx) => (
            <li key={idx} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[41px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-gold-bright to-gold ring-4 ring-ink"
              />
              {item.year && (
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-text">{item.year}</p>
              )}
              <h3 className="mt-1.5 text-lg font-semibold leading-snug text-ink-100 sm:text-xl">
                {item.role}
                {item.organization && (
                  <span className="font-normal text-ink-400">
                    {' '}
                    · {item.organization}
                  </span>
                )}
              </h3>
              {item.description && (
                <p className="mt-2 text-sm leading-relaxed text-ink-400 text-pretty">{item.description}</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
};
