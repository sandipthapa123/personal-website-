import React from 'react';

export interface QuoteBlockProps {
  text: string;
  attribution?: string;
  attributionUrl?: string;
  variant?: 'blockquote' | 'pullquote' | 'testimonial';
}

const Attribution: React.FC<{ attribution: string; attributionUrl?: string; className?: string }> = ({
  attribution,
  attributionUrl,
  className = '',
}) => (
  <cite className={`block not-italic ${className}`.trim()}>
    <span aria-hidden="true">— </span>
    {attributionUrl ? (
      <a href={attributionUrl} target="_blank" rel="noreferrer" className="rounded underline underline-offset-2">
        {attribution}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : (
      attribution
    )}
  </cite>
);

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ text, attribution, attributionUrl, variant = 'blockquote' }) => {
  if (variant === 'pullquote') {
    return (
      <aside className="relative overflow-hidden rounded-3xl border-y-2 border-gold/40 bg-gold/[0.06] px-6 py-8 text-center sm:px-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-0 font-serif-display text-[6rem] leading-none text-gold/20"
        >
          &ldquo;
        </span>
        <div className="relative space-y-4">
          <blockquote className="font-serif-display text-xl font-semibold italic leading-snug text-ink-100 text-balance sm:text-2xl">
            &ldquo;{text}&rdquo;
          </blockquote>
          {attribution && (
            <Attribution
              attribution={attribution}
              attributionUrl={attributionUrl}
              className="text-xs font-semibold uppercase tracking-wider text-gold-text"
            />
          )}
        </div>
      </aside>
    );
  }

  if (variant === 'testimonial') {
    return (
      <figure className="edge-lit relative rounded-2xl border border-ink-border bg-ink-elevated p-6 shadow-sm shadow-black/5">
        <blockquote className="text-base italic leading-relaxed text-ink-100 text-pretty">
          &ldquo;{text}&rdquo;
        </blockquote>
        {attribution && (
          <figcaption className="mt-4 border-t border-ink-border pt-4">
            <Attribution
              attribution={attribution}
              attributionUrl={attributionUrl}
              className="text-xs font-bold uppercase tracking-wider text-gold-text"
            />
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="rounded-r-2xl border-l-4 border-gold bg-ink-elevated p-6">
      <blockquote className="text-base italic leading-relaxed text-ink-100 text-pretty">&ldquo;{text}&rdquo;</blockquote>
      {attribution && (
        <figcaption className="mt-3">
          <Attribution attribution={attribution} attributionUrl={attributionUrl} className="text-xs font-bold text-ink-400" />
        </figcaption>
      )}
    </figure>
  );
};
