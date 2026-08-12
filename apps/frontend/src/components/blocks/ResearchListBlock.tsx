import React from 'react';
import { Badge, Card, EmptyState, Section, SectionHeading, StretchedLink, slugifyId } from '../ui/primitives';

export interface ResearchListProps {
  heading?: string;
  items?: Array<{
    title: string;
    status?: string;
    timeline?: string;
    description?: string;
    type?: string;
    url?: string;
  }>;
}

export const ResearchListBlock: React.FC<ResearchListProps> = ({ heading, items = [] }) => {
  const headingId = heading ? slugifyId(heading, 'research') : undefined;

  return (
    <Section labelledBy={headingId} className="space-y-7">
      {heading && <SectionHeading id={headingId} title={heading} />}

      {items.length === 0 ? (
        <EmptyState
          title="No research projects listed yet"
          description="Active and completed research projects will appear here."
          icon={<span className="text-lg">◈</span>}
        />
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0">
          {items.map((item, idx) => (
            <Card
              as="li"
              key={idx}
              interactive={!!item.url}
              className="edge-lit space-y-3 hover:border-accentBlue/50 focus-within:border-accentBlue/60"
            >
              {(item.status || item.timeline) && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {item.status && <Badge tone="blue">{item.status}</Badge>}
                  {item.timeline && <span className="text-xs font-medium text-ink-400">{item.timeline}</span>}
                </div>
              )}

              <h3 className="text-lg font-semibold leading-snug text-ink-100 transition-colors group-hover:text-accentBlue text-pretty sm:text-xl">
                {item.url ? <StretchedLink href={item.url}>{item.title}</StretchedLink> : item.title}
              </h3>

              {item.description && <p className="text-sm leading-relaxed text-ink-400">{item.description}</p>}
            </Card>
          ))}
        </ul>
      )}
    </Section>
  );
};
