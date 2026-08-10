import React from 'react';

export interface PublicationListProps {
  heading?: string;
  items?: Array<{
    title: string;
    journal?: string;
    publisher?: string;
    authors?: string[];
    year?: number;
    doi?: string;
    pdfUrl?: string;
    citationApa?: string;
    citationMla?: string;
    type?: string;
    url?: string;
  }>;
}

export const PublicationListBlock: React.FC<PublicationListProps> = ({ heading, items = [] }) => (
  <section className="space-y-6">
    {heading && (
      <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-ink-100 tracking-tight">{heading}</h2>
    )}
    <div className="space-y-4">
      {items.map((pub, idx) => (
        <article
          key={idx}
          className="p-6 bg-ink-elevated border border-ink-border rounded-2xl space-y-3 hover:border-emerald-700/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-200"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            {(pub.journal || pub.publisher) && (
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {pub.journal || pub.publisher}
              </span>
            )}
            {pub.type && (
              <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-bold rounded uppercase tracking-wider">
                {pub.type}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-ink-100 leading-snug">
            {pub.url ? (
              <a
                href={pub.url}
                aria-label={`View publication: ${pub.title}`}
                className="hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded transition-colors"
              >
                {pub.title}
              </a>
            ) : (
              pub.title
            )}
          </h3>

          {pub.authors && pub.authors.length > 0 && (
            <p className="text-xs text-ink-400">Authors: {pub.authors.join(', ')}</p>
          )}

          {pub.citationApa && (
            <div className="p-3 bg-ink rounded-lg text-[11px] font-mono text-ink-400 border border-ink-border leading-relaxed">
              APA: {pub.citationApa}
            </div>
          )}

          <div className="flex items-center gap-4 flex-wrap pt-1">
            {pub.doi && (
              <a
                href={`https://doi.org/${pub.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-gold hover:brightness-110 font-semibold transition-colors"
              >
                DOI: {pub.doi}
              </a>
            )}
            {pub.pdfUrl && (
              <a
                href={pub.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                📄 Download PDF
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  </section>
);
