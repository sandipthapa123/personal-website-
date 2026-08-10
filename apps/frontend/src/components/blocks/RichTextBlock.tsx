import React from 'react';

export interface RichTextBlockProps {
  html?: string;
  content?: string;
  text?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: string;
  color?: string;
  background?: string;
}

export const RichTextBlock: React.FC<RichTextBlockProps> = ({
  html,
  content,
  text,
  textAlign = 'left',
  fontSize,
  color,
  background,
}) => {
  const bodyHtml = html || content || text || '';
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }[textAlign];

  return (
    <div
      className={`prose max-w-none text-base ${alignClass}`}
      style={{
        fontSize: fontSize || undefined,
        color: color || undefined,
        backgroundColor: background || undefined,
      }}
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
};
