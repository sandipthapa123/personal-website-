import React from 'react';

export interface ImageBlockProps {
  src: string;
  alt: string;
  caption?: string;
  alignment?: 'left' | 'center' | 'right' | 'full-width';
  loading?: 'lazy' | 'eager';
  decorative?: boolean;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  src,
  alt,
  caption,
  alignment = 'center',
  loading = 'lazy',
  decorative = false,
}) => {
  const alignClass = {
    left: 'mr-auto max-w-xl',
    center: 'mx-auto max-w-3xl',
    right: 'ml-auto max-w-xl',
    'full-width': 'w-full',
  }[alignment];

  return (
    <figure className={`my-6 space-y-2 ${alignClass}`}>
      <img
        src={src}
        alt={decorative ? '' : alt}
        loading={loading}
        className="w-full rounded-2xl border border-ink-border shadow-xl shadow-black/20 object-cover"
        aria-hidden={decorative ? 'true' : undefined}
      />
      {caption && (
        <figcaption className="text-center text-xs text-ink-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
