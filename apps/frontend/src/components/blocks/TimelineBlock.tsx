import React from 'react';

export interface TimelineItem {
  year: string;
  role: string;
  organization: string;
  description: string;
}

export interface TimelineBlockProps {
  title?: string;
  items?: TimelineItem[];
}

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  title = 'Career & Experience',
  items = [
    {
      year: '2024 - Present',
      role: 'Senior Software Architect',
      organization: 'Enterprise Solutions',
      description: 'Designing high-throughput distributed modular monoliths & cloud native infrastructure.',
    },
    {
      year: '2021 - 2024',
      role: 'Full-Stack Lead Engineer',
      organization: 'Tech Research Institute',
      description: 'Built scalable backend engines and accessible UI component design systems.',
    },
  ],
}) => {
  return (
    <section className="py-12 px-4 max-w-4xl mx-auto">
      {title && <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">{title}</h2>}
      <div className="relative border-l-2 border-sky-500 pl-6 ml-4 space-y-8">
        {items.map((item, idx) => (
          <div key={idx} className="relative group">
            <span className="absolute -left-[31px] top-1 w-4 h-4 bg-sky-500 rounded-full ring-4 ring-white dark:ring-slate-900" />
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              {item.year}
            </span>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-1">
              {item.role} <span className="font-normal text-slate-500">@ {item.organization}</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
