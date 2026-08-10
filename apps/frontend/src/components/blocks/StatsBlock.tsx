import React from 'react';

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

export const StatsBlock: React.FC<StatsBlockProps> = ({ heading, subheading, stats = [] }) => (
  <section className="bg-editorial-canvas bg-ink-elevated border border-ink-border rounded-2xl p-8 space-y-6">
    {heading && (
      <div className="space-y-1">
        <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-ink-100 tracking-tight">{heading}</h2>
        {subheading && <p className="text-sm text-ink-400">{subheading}</p>}
      </div>
    )}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="group text-center space-y-2 p-4 rounded-xl bg-ink/60 border border-ink-border hover:border-gold/40 transition-all">
          {stat.icon && (
            <div className="text-2xl">{stat.icon}</div>
          )}
          <div className="font-serif-display text-3xl sm:text-4xl font-semibold text-gold transition-colors">
            {stat.value}
          </div>
          <div className="text-xs text-ink-400 font-semibold uppercase tracking-wider">{stat.label}</div>
          {stat.description && (
            <p className="text-[10px] text-ink-400/70 leading-snug">{stat.description}</p>
          )}
        </div>
      ))}
    </div>
  </section>
);
