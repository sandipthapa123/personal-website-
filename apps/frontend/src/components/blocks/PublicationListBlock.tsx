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
  }>;
}

export const PublicationListBlock: React.FC<PublicationListProps> = ({ heading, items = [] }) => (
  <section className="space-y-6">
    {heading && (
      <h2 className="text-2xl font-extrabold text-white tracking-tight">{heading}</h2>
    )}
    <div className="space-y-4">
      {items.map((pub, idx) => (
        <article
          key={idx}
          className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-emerald-800/50 transition-all"
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

          <h3 className="text-lg font-bold text-white leading-snug">{pub.title}</h3>

          {pub.authors && pub.authors.length > 0 && (
            <p className="text-xs text-slate-400">Authors: {pub.authors.join(', ')}</p>
          )}

          {pub.citationApa && (
            <div className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-slate-400 border border-slate-800 leading-relaxed">
              APA: {pub.citationApa}
            </div>
          )}

          <div className="flex items-center gap-4 flex-wrap pt-1">
            {pub.doi && (
              <a
                href={`https://doi.org/${pub.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold transition-colors"
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
