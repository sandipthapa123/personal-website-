import React from 'react';

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

export const ResearchListBlock: React.FC<ResearchListProps> = ({ heading, items = [] }) => (
  <section className="space-y-6">
    {heading && (
      <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-ink-100 tracking-tight">{heading}</h2>
    )}
    <div className="grid grid-cols-1 gap-4">
      {items.map((item, idx) => (
        <article
          key={idx}
          className="group p-6 bg-ink-elevated border border-ink-border rounded-2xl space-y-3 hover:border-indigo-700/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-200"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            {item.status && (
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded">
                {item.status}
              </span>
            )}
            {item.timeline && (
              <span className="text-xs text-ink-400 font-medium">{item.timeline}</span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-ink-100 group-hover:text-indigo-300 transition-colors">
            {item.url ? (
              <a
                href={item.url}
                aria-label={`View project: ${item.title}`}
                className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              >
                {item.title}
              </a>
            ) : (
              item.title
            )}
          </h3>
          {item.description && (
            <p className="text-sm text-ink-400 leading-relaxed">{item.description}</p>
          )}
        </article>
      ))}
    </div>
  </section>
);
