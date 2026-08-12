import React from 'react';
import { Section, SectionHeading, slugifyId } from '../ui/primitives';

export interface TextBlockProps {
  heading?: string;
  content?: string;
  subheading?: string;
  callout?: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({ heading, content, subheading, callout }) => {
  const headingId = heading ? slugifyId(heading, 'text') : undefined;

  return (
    <Section labelledBy={headingId} tone="panel" className="edge-lit space-y-5">
      {heading && <SectionHeading id={headingId} title={heading} eyebrow={subheading} />}
      {!heading && subheading && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-text">{subheading}</p>
      )}

      {callout && (
        <p className="rounded-xl border-l-4 border-gold bg-gold/[0.08] px-4 py-3 text-sm font-medium text-ink-100">
          {callout}
        </p>
      )}

      {content && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-400 sm:text-base text-pretty">{content}</p>
      )}
    </Section>
  );
};
