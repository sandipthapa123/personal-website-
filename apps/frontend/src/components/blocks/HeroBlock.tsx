import React from 'react';
import Image from 'next/image';

export interface HeroBlockProps {
  title?: string;
  subtitle?: string;
  tagline?: string;
  avatarUrl?: string;
  primaryCta?: { label: string; url: string };
  secondaryCta?: { label: string; url: string };
}

export const HeroBlock: React.FC<HeroBlockProps> = ({
  title = 'Welcome to my Platform',
  subtitle = 'Senior Software Architect & Researcher',
  tagline,
  avatarUrl,
  primaryCta,
  secondaryCta,
}) => {
  return (
    <section className="relative overflow-hidden bg-editorial-canvas border-b border-ink-border w-screen left-1/2 -translate-x-1/2 -mt-12">
      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid gap-12 items-center ${
          avatarUrl ? 'lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]' : ''
        }`}
      >
        {avatarUrl && (
          <div className="animate-fade-up relative mx-auto w-full max-w-sm lg:max-w-none order-1">
            <div
              aria-hidden="true"
              className="absolute -inset-4 sm:-inset-6 rounded-[2rem] border border-gold/40 -translate-x-3 -translate-y-3 sm:-translate-x-4 sm:-translate-y-4"
            />
            <div
              aria-hidden="true"
              className="absolute -inset-4 sm:-inset-6 rounded-[2rem] bg-gold/12 translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4"
            />
            <div className="relative rounded-[1.75rem] overflow-hidden border border-ink-border shadow-2xl shadow-black/40">
              <Image
                src={avatarUrl}
                alt={title ? `Portrait of ${title}` : 'Professional portrait'}
                width={640}
                height={800}
                priority
                className="w-full h-auto aspect-[4/5] object-cover"
              />
            </div>
          </div>
        )}

        <div className={`animate-fade-up space-y-6 text-center ${avatarUrl ? 'lg:text-left order-2' : 'max-w-3xl mx-auto'}`}>
          {tagline && (
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
              {tagline}
            </p>
          )}
          <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink-100 leading-[1.08]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg sm:text-xl text-ink-400 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
              {subtitle}
            </p>
          )}
          <div className={`pt-2 flex flex-wrap gap-4 justify-center ${avatarUrl ? 'lg:justify-start' : ''}`}>
            {primaryCta && (
              <a
                href={primaryCta.url}
                className="px-7 py-3 font-semibold text-ink bg-gold rounded-full shadow-lg shadow-gold/10 hover:brightness-110 transition-all focus-visible:ring"
              >
                {primaryCta.label}
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.url}
                className="px-7 py-3 font-semibold text-ink-100 bg-transparent rounded-full border border-ink-border hover:border-gold/60 hover:text-gold transition-colors focus-visible:ring"
              >
                {secondaryCta.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
