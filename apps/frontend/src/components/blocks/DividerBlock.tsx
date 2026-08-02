import React from 'react';

export interface DividerBlockProps {
  style?: 'solid' | 'dashed' | 'dotted' | 'double';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ style = 'solid', spacing = 'md' }) => {
  const marginClass = {
    sm: 'my-4',
    md: 'my-8',
    lg: 'my-12',
    xl: 'my-16',
  }[spacing];

  const borderClass = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
    double: 'border-double border-b-4',
  }[style];

  return <hr className={`border-t border-slate-800 ${marginClass} ${borderClass}`} />;
};
