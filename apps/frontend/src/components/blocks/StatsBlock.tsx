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
  <section className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
    {heading && (
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">{heading}</h2>
        {subheading && <p className="text-sm text-slate-400">{subheading}</p>}
      </div>
    )}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="group text-center space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-800/50 transition-all">
          {stat.icon && (
            <div className="text-2xl">{stat.icon}</div>
          )}
          <div className="text-3xl sm:text-4xl font-black text-sky-400 group-hover:text-sky-300 transition-colors">
            {stat.value}
          </div>
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</div>
          {stat.description && (
            <p className="text-[10px] text-slate-500 leading-snug">{stat.description}</p>
          )}
        </div>
      ))}
    </div>
  </section>
);
