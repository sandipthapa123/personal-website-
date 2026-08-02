import React from 'react';

export interface TextBlockProps {
  heading?: string;
  content?: string;
  subheading?: string;
  callout?: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({ heading, content, subheading, callout }) => (
  <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-4">
    {heading && (
      <h2 className="text-2xl font-extrabold text-white tracking-tight">{heading}</h2>
    )}
    {subheading && (
      <p className="text-sm font-semibold text-sky-400 uppercase tracking-wider">{subheading}</p>
    )}
    {callout && (
      <div className="p-4 bg-sky-950/40 border border-sky-800/40 rounded-xl text-sky-200 text-sm font-medium">
        {callout}
      </div>
    )}
    {content && (
      <p className="text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">{content}</p>
    )}
  </section>
);
