import React from 'react';
import { BlockTypes } from '@cms/constants';

import { HeroBlock } from './HeroBlock';
import { TimelineBlock } from './TimelineBlock';
import { CardGridBlock } from './CardGridBlock';
import { TextBlock } from './TextBlock';
import { AuthorCardBlock } from './AuthorCardBlock';
import { ResearchListBlock } from './ResearchListBlock';
import { PublicationListBlock } from './PublicationListBlock';
import { StatsBlock } from './StatsBlock';
import { ContactFormBlock } from './ContactFormBlock';
import { ArticleListBlock } from './ArticleListBlock';

import { RichTextBlock } from './RichTextBlock';
import { HeadingBlock } from './HeadingBlock';
import { ImageBlock } from './ImageBlock';
import { QuoteBlock } from './QuoteBlock';
import { CodeBlock } from './CodeBlock';
import { TableBlock } from './TableBlock';
import { DividerBlock } from './DividerBlock';
import { SpacerBlock } from './SpacerBlock';

const blockMap: Record<string, React.FC<any>> = {
  [BlockTypes.HERO]: HeroBlock,
  [BlockTypes.TIMELINE]: TimelineBlock,
  CARD_GRID: CardGridBlock,
  TEXT_BLOCK: TextBlock,
  AUTHOR_CARD: AuthorCardBlock,
  RESEARCH_LIST: ResearchListBlock,
  PUBLICATION_LIST: PublicationListBlock,
  STATS: StatsBlock,
  CONTACT_FORM: ContactFormBlock,
  ARTICLE_LIST: ArticleListBlock,

  RICH_TEXT: RichTextBlock,
  PARAGRAPH: RichTextBlock,
  HEADING: HeadingBlock,
  IMAGE: ImageBlock,
  QUOTE: QuoteBlock,
  CODE_BLOCK: CodeBlock,
  TABLE: TableBlock,
  DIVIDER: DividerBlock,
  SPACER: SpacerBlock,
};

export function renderBlockComponent(type: string, props: any, key: string) {
  const Component = blockMap[type];
  if (!Component) {
    return (
      <div
        key={key}
        className="p-4 border border-dashed border-amber-700/50 bg-amber-950/20 rounded-lg text-amber-400 text-xs font-mono"
        aria-hidden="true"
      >
        [Unregistered Block: <strong>{type}</strong>]
      </div>
    );
  }
  return <Component key={key} {...props} />;
}
