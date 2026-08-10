import React from 'react';

export interface TextBlockProps {
  heading?: string;
  content?: string;
  subheading?: string;
  callout?: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({ heading, content, subheading, callout }) => (
  <section className="bg-ink-elevated border border-ink-border rounded-2xl p-8 space-y-4">
    {heading && (
      <h2 className="font-serif-display text-2xl font-semibold text-ink-100 tracking-tight">{heading}</h2>
    )}
    {subheading && (
      <p className="text-sm font-semibold text-gold uppercase tracking-wider">{subheading}</p>
    )}
    {callout && (
      <div className="p-4 bg-gold/[0.08] border border-gold/30 rounded-xl text-parchment text-sm font-medium">
        {callout}
      </div>
    )}
    {content && (
      <p className="text-ink-400 leading-relaxed text-sm sm:text-base whitespace-pre-line">{content}</p>
    )}
  </section>
);
