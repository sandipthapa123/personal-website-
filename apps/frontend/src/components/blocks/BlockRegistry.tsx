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
    // An unknown block is an authoring/deployment problem, not something a
    // visitor should ever see — this used to render a dashed debug box on the
    // live site. Surface it loudly in development and render nothing in
    // production so the page degrades cleanly instead of showing placeholder UI.
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div
          key={key}
          className="rounded-lg border border-dashed border-warningText/50 bg-warningText/10 p-4 font-mono text-xs text-warningText"
        >
          [dev] Unregistered block type: <strong>{type}</strong>
        </div>
      );
    }
    return null;
  }
  return <Component key={key} {...props} />;
}
