import React from 'react';
import { EmptyState, Section, SectionHeading, slugifyId } from '../ui/primitives';

export interface StatsBlockProps {
  heading?: string;
  subheading?: string;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: string;
    description?: string;
  }>;
}

export const StatsBlock: React.FC<StatsBlockProps> = ({ heading, subheading, stats = [] }) => {
  const headingId = heading ? slugifyId(heading, 'stats') : undefined;

  return (
    <Section labelledBy={headingId} tone="accent" className="edge-lit space-y-7">
      {heading && <SectionHeading id={headingId} title={heading} description={subheading} />}

      {stats.length === 0 ? (
        <EmptyState title="No statistics available yet" />
      ) : (
        // A definition list is the correct semantic pairing for label/value
        // metrics — screen readers announce each figure with its label rather
        // than reading a wall of orphaned numbers.
        <dl className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl border border-ink-border bg-ink/60 p-5 text-center transition duration-200 hover:border-gold/50 motion-safe:hover:-translate-y-1"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
              />
              {stat.icon && (
                <div className="mb-1 text-2xl" aria-hidden="true">
                  {stat.icon}
                </div>
              )}
              <dd className="font-serif-display text-3xl font-semibold text-gold-text sm:text-4xl">{stat.value}</dd>
              <dt className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{stat.label}</dt>
              {stat.description && (
                <p className="mt-1 text-[10px] leading-snug text-ink-400/80">{stat.description}</p>
              )}
            </div>
          ))}
        </dl>
      )}
    </Section>
  );
};
