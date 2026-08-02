import React from 'react';

export interface SpacerBlockProps {
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const SpacerBlock: React.FC<SpacerBlockProps> = ({ height = 'md' }) => {
  const hClass = {
    xs: 'h-4',
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
    '2xl': 'h-32',
  }[height];

  return <div className={hClass} aria-hidden="true" />;
};
