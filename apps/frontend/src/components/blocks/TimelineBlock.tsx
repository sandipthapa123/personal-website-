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
      {title && <h2 className="font-serif-display text-3xl font-semibold text-ink-100 mb-8 text-center">{title}</h2>}
      <div className="relative border-l-2 border-gold/50 pl-6 ml-4 space-y-8">
        {items.map((item, idx) => (
          <div key={idx} className="relative group">
            <span className="absolute -left-[31px] top-1 w-4 h-4 bg-gold rounded-full ring-4 ring-ink" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gold">
              {item.year}
            </span>
            <h3 className="text-xl font-semibold text-ink-100 mt-1">
              {item.role} <span className="font-normal text-ink-400">@ {item.organization}</span>
            </h3>
            <p className="text-ink-400 mt-2 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
