import React from 'react';
import Image from 'next/image';
import { ButtonLink } from '../ui/primitives';

export interface HeroBlockProps {
  title?: string;
  subtitle?: string;
  tagline?: string;
  avatarUrl?: string;
  primaryCta?: { label: string; url: string };
  secondaryCta?: { label: string; url: string };
}

export const HeroBlock: React.FC<HeroBlockProps> = ({
  title = 'Sandip Thapa',
  subtitle,
  tagline,
  avatarUrl,
  primaryCta,
  secondaryCta,
}) => {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative -mt-10 overflow-hidden border-b border-ink-border bg-editorial-canvas sm:-mt-14"
      // Breaks out of the padded content column to full width. Negative margins
      // derived from the element's own position are used rather than `w-screen`,
      // which overflows by the scrollbar width and causes horizontal scrolling.
      style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
    >
      {/* Decorative aurora + hairline grid, purely presentational */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />

      <div
        className={`relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:gap-14 sm:px-6 sm:py-24 lg:py-28 ${
          avatarUrl ? 'lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]' : ''
        }`}
      >
        {avatarUrl && (
          <div className="animate-fade-up relative order-1 mx-auto w-full max-w-sm lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-4 -translate-x-3 -translate-y-3 rounded-[2rem] border border-gold/40 sm:-inset-6 sm:-translate-x-4 sm:-translate-y-4"
            />
            <div
              aria-hidden="true"
              className="absolute -inset-4 translate-x-3 translate-y-3 rounded-[2rem] bg-gold/12 sm:-inset-6 sm:translate-x-4 sm:translate-y-4"
            />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-ink-border shadow-2xl shadow-black/40">
              <Image
                src={avatarUrl}
                alt={title ? `Portrait of ${title}` : 'Professional portrait'}
                width={640}
                height={800}
                priority
                sizes="(max-width: 1024px) 24rem, 32rem"
                className="aspect-[4/5] h-auto w-full object-cover"
              />
            </div>
          </div>
        )}

        <div
          className={`animate-fade-up order-2 space-y-6 text-center ${
            avatarUrl ? 'lg:text-left' : 'mx-auto max-w-3xl'
          }`}
        >
          {tagline && (
            <p
              className={`inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-gold/[0.08] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-text`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              {tagline}
            </p>
          )}

          <h1
            id="hero-title"
            className="font-serif-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink-100 text-balance sm:text-5xl lg:text-6xl"
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className={`text-lg font-light leading-relaxed text-ink-400 text-pretty sm:text-xl ${
                avatarUrl ? 'max-w-2xl lg:mx-0' : 'max-w-2xl'
              } mx-auto`}
            >
              {subtitle}
            </p>
          )}

          {(primaryCta || secondaryCta) && (
            <div
              className={`flex flex-wrap justify-center gap-3 pt-3 ${avatarUrl ? 'lg:justify-start' : ''}`}
            >
              {primaryCta && (
                <ButtonLink href={primaryCta.url} variant="primary">
                  {primaryCta.label}
                  <span aria-hidden="true">→</span>
                </ButtonLink>
              )}
              {secondaryCta && (
                <ButtonLink href={secondaryCta.url} variant="secondary">
                  {secondaryCta.label}
                </ButtonLink>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
