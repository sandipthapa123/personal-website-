import React from 'react';
import { BlockTypes } from '@cms/constants';
import { HeroBlock } from './HeroBlock';
import { TimelineBlock } from './TimelineBlock';

const blockMap: Record<string, React.FC<any>> = {
  [BlockTypes.HERO]: HeroBlock,
  [BlockTypes.TIMELINE]: TimelineBlock,
};

export function renderBlockComponent(type: string, props: any, key: string) {
  const Component = blockMap[type];
  if (!Component) {
    return (
      <div key={key} className="p-4 border border-dashed border-amber-500 bg-amber-50 rounded-md text-amber-800 text-sm">
        Unregistered Block Component: <strong>{type}</strong>
      </div>
    );
  }
  return <Component key={key} {...props} />;
}
