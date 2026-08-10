import React from 'react';

export interface HeadingBlockProps {
  text: string;
  level?: '1' | '2' | '3' | '4' | '5' | '6' | number;
  anchorId?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  text,
  level = '2',
  anchorId,
  textAlign = 'left',
}) => {
  const lvl = String(level);
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign];

  const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(`h${lvl}`) ? `h${lvl}` : 'h2') as keyof JSX.IntrinsicElements;

  const sizeClasses: Record<string, string> = {
    '1': 'font-serif-display text-3xl sm:text-5xl font-semibold text-ink-100 tracking-tight leading-tight my-6',
    '2': 'font-serif-display text-2xl sm:text-3xl font-semibold text-ink-100 tracking-tight my-4',
    '3': 'text-xl sm:text-2xl font-bold text-ink-100 my-3',
    '4': 'text-lg font-bold text-ink-100 my-2',
    '5': 'text-base font-semibold text-ink-400 my-2',
    '6': 'text-sm font-semibold text-gold my-1 uppercase tracking-wider',
  };

  return (
    <Tag id={anchorId} className={`${sizeClasses[lvl] || sizeClasses['2']} ${alignClass}`}>
      {text}
    </Tag>
  );
};
