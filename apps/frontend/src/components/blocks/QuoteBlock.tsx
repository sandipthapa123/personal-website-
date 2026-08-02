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
      <aside className="my-8 py-6 px-8 border-y-2 border-sky-500 bg-sky-950/20 text-center space-y-3">
        <blockquote className="text-xl sm:text-2xl font-bold text-sky-200 leading-snug italic">
          "{text}"
        </blockquote>
        {attribution && (
          <cite className="block text-xs font-semibold text-sky-400 not-italic uppercase tracking-wider">
            — {attributionUrl ? <a href={attributionUrl} target="_blank" rel="noreferrer" className="underline">{attribution}</a> : attribution}
          </cite>
        )}
      </aside>
    );
  }

  return (
    <blockquote className="my-6 p-6 bg-slate-900 border-l-4 border-sky-600 rounded-r-2xl space-y-2">
      <p className="text-base text-slate-200 italic leading-relaxed">"{text}"</p>
      {attribution && (
        <cite className="block text-xs font-bold text-slate-400 not-italic">
          — {attributionUrl ? <a href={attributionUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">{attribution}</a> : attribution}
        </cite>
      )}
    </blockquote>
  );
};
