import React from 'react';

export interface QuoteBlockProps {
  text: string;
  attribution?: string;
  attributionUrl?: string;
  variant?: 'blockquote' | 'pullquote' | 'testimonial';
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({
  text,
  attribution,
  attributionUrl,
  variant = 'blockquote',
}) => {
  if (variant === 'pullquote') {
    return (
      <aside className="my-8 py-6 px-8 border-y-2 border-gold/50 bg-gold/[0.06] text-center space-y-3">
        <blockquote className="font-serif-display text-xl sm:text-2xl font-semibold text-parchment leading-snug italic">
          &ldquo;{text}&rdquo;
        </blockquote>
        {attribution && (
          <cite className="block text-xs font-semibold text-gold not-italic uppercase tracking-wider">
            — {attributionUrl ? <a href={attributionUrl} target="_blank" rel="noreferrer" className="underline">{attribution}</a> : attribution}
          </cite>
        )}
      </aside>
    );
  }

  return (
    <blockquote className="my-6 p-6 bg-ink-elevated border-l-4 border-gold rounded-r-2xl space-y-2">
      <p className="text-base text-ink-100 italic leading-relaxed">&ldquo;{text}&rdquo;</p>
      {attribution && (
        <cite className="block text-xs font-bold text-ink-400 not-italic">
          — {attributionUrl ? <a href={attributionUrl} target="_blank" rel="noreferrer" className="text-gold hover:underline">{attribution}</a> : attribution}
        </cite>
      )}
    </blockquote>
  );
};
