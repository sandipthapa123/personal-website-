import React from 'react';

/* ==========================================================================
   DESIGN SYSTEM PRIMITIVES

   Every block composes these instead of hand-rolling its own surface, heading
   and spacing rules. That is what keeps one visual identity across pages that
   are otherwise assembled dynamically from backend block schemas.

   All colour comes from the semantic theme tokens (ink / gold / accentBlue),
   so light, dark, sepia and high-contrast modes are handled for free.
   ========================================================================== */

/** Stable, DOM-safe id from a heading string — used to wire aria-labelledby. */
export function slugifyId(value: string, prefix = 'sec'): string {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${prefix}-${base || 'section'}`;
}

/* ── Section ─────────────────────────────────────────────────────────────── */

export type SectionTone = 'plain' | 'panel' | 'accent';

export interface SectionProps {
  children: React.ReactNode;
  /** Wired to aria-labelledby so screen readers announce the section's purpose. */
  labelledBy?: string;
  tone?: SectionTone;
  className?: string;
}

const sectionTone: Record<SectionTone, string> = {
  plain: '',
  panel:
    'rounded-3xl border border-ink-border bg-ink-elevated/70 p-6 sm:p-8 shadow-sm shadow-black/5 backdrop-blur-[2px]',
  accent:
    'relative overflow-hidden rounded-3xl border border-gold/25 bg-editorial-canvas bg-ink-elevated/60 p-6 sm:p-8 shadow-sm shadow-black/5',
};

export const Section: React.FC<SectionProps> = ({ children, labelledBy, tone = 'plain', className = '' }) => (
  <section aria-labelledby={labelledBy} className={`${sectionTone[tone]} ${className}`.trim()}>
    {children}
  </section>
);

/* ── Section heading ─────────────────────────────────────────────────────── */

export interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  /** Heading rank — sections inside a page body are h2 by default. */
  as?: 'h2' | 'h3';
  align?: 'start' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  id,
  eyebrow,
  title,
  description,
  as: Tag = 'h2',
  align = 'start',
  className = '',
}) => (
  <div className={`space-y-2.5 ${align === 'center' ? 'text-center' : ''} ${className}`.trim()}>
    {eyebrow && (
      <p
        className={`inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-text ${
          align === 'center' ? 'justify-center' : ''
        }`}
      >
        <span className="h-px w-7 bg-gold/70" aria-hidden="true" />
        {eyebrow}
      </p>
    )}
    <Tag
      id={id}
      className={`font-serif-display font-semibold tracking-tight text-ink-100 text-balance ${
        Tag === 'h2' ? 'text-2xl sm:text-[1.75rem] lg:text-3xl leading-[1.15]' : 'text-xl sm:text-2xl leading-snug'
      }`}
    >
      {title}
    </Tag>
    {description && (
      <p className={`text-sm sm:text-[0.95rem] text-ink-400 leading-relaxed ${align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>
        {description}
      </p>
    )}
    <span
      aria-hidden="true"
      className={`block h-0.5 w-12 rounded-full bg-gradient-to-r from-gold to-gold/10 ${align === 'center' ? 'mx-auto' : ''}`}
    />
  </div>
);

/* ── Card ────────────────────────────────────────────────────────────────── */

export interface CardProps {
  children: React.ReactNode;
  as?: 'article' | 'div' | 'li';
  /**
   * Adds lift/glow affordances. Only pass this when the card really does contain
   * a link — a card that looks clickable but isn't is both a UX and an a11y bug.
   */
  interactive?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, as: Tag = 'div', interactive = false, className = '' }) => (
  <Tag
    className={[
      'relative rounded-2xl border border-ink-border bg-ink-elevated p-5 sm:p-6',
      'shadow-sm shadow-black/5',
      interactive
        ? // focus-within keeps the keyboard experience identical to the mouse one,
          // since the affordance is driven by the link nested inside.
          'group transition duration-200 motion-safe:hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl hover:shadow-black/10 focus-within:border-gold/60 focus-within:shadow-xl'
        : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </Tag>
);

/**
 * Makes the whole card a click target while keeping exactly one link in the
 * accessibility tree. Text stays selectable outside the pseudo-element.
 */
export const StretchedLink: React.FC<{ href: string; children: React.ReactNode; className?: string }> = ({
  href,
  children,
  className = '',
}) => (
  <a
    href={href}
    className={`rounded outline-offset-4 before:absolute before:inset-0 before:z-10 before:content-[''] ${className}`.trim()}
  >
    {children}
  </a>
);

/* ── Badge ───────────────────────────────────────────────────────────────── */

export type BadgeTone = 'gold' | 'blue' | 'neutral' | 'success' | 'warning';

const badgeTone: Record<BadgeTone, string> = {
  gold: 'bg-gold/15 text-gold-text border-gold/30',
  blue: 'bg-accentBlue/10 text-accentBlue border-accentBlue/30',
  neutral: 'bg-ink-raised text-ink-400 border-ink-border',
  success: 'bg-successText/10 text-successText border-successText/30',
  warning: 'bg-warningText/10 text-warningText border-warningText/30',
};

export const Badge: React.FC<{ children: React.ReactNode; tone?: BadgeTone; className?: string }> = ({
  children,
  tone = 'gold',
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeTone[tone]} ${className}`.trim()}
  >
    {children}
  </span>
);

/* ── Buttons / CTAs ──────────────────────────────────────────────────────── */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/**
 * Shared button styling. `min-h-[44px]` keeps every control at the WCAG 2.2 AAA
 * (2.5.5) target size, which the previous ad-hoc padding-only buttons missed.
 */
export function buttonStyles(variant: ButtonVariant = 'primary', className = ''): string {
  const base =
    'inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full px-6 py-2.5 text-sm font-semibold transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed';
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-br from-gold-bright to-gold text-onGold shadow-lg shadow-gold/20 hover:brightness-110 motion-safe:hover:-translate-y-0.5',
    secondary:
      'border border-ink-border bg-ink-elevated text-ink-100 hover:border-gold/60 hover:text-gold-text motion-safe:hover:-translate-y-0.5',
    ghost: 'text-ink-100 hover:bg-ink-elevated hover:text-gold-text',
  };
  return `${base} ${variants[variant]} ${className}`.trim();
}

export const ButtonLink: React.FC<{
  href: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}> = ({ href, variant = 'primary', children, className = '' }) => (
  <a href={href} className={buttonStyles(variant, className)}>
    {children}
  </a>
);

/* ── Empty state ─────────────────────────────────────────────────────────── */

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  /** Announce to screen readers when the emptiness is the result of an action. */
  live?: boolean;
}

/**
 * Replaces the previous behaviour where a section with no items rendered as a
 * bare heading followed by nothing — visually broken and silent to a screen
 * reader. Now the absence of content is stated explicitly.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, className = '', live = false }) => (
  <div
    {...(live ? { role: 'status', 'aria-live': 'polite' } : {})}
    className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-border bg-ink-elevated/40 px-6 py-10 text-center ${className}`.trim()}
  >
    {icon && (
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-border bg-ink-elevated text-gold-text"
      >
        {icon}
      </span>
    )}
    <p className="text-sm font-semibold text-ink-100">{title}</p>
    {description && <p className="max-w-sm text-xs leading-relaxed text-ink-400">{description}</p>}
  </div>
);

/* ── Meta row ────────────────────────────────────────────────────────────── */

export const MetaRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-ink-400 ${className}`.trim()}>
    {children}
  </div>
);

export const MetaItem: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; emphasis?: boolean }> = ({
  children,
  icon,
  emphasis = false,
}) => (
  <span className={`inline-flex items-center gap-1 ${emphasis ? 'font-semibold text-gold-text' : ''}`}>
    {icon && (
      <span aria-hidden="true" className="opacity-80">
        {icon}
      </span>
    )}
    {children}
  </span>
);

/** Thin gradient rule used to separate stacked sections. */
export const SectionDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`h-px w-full bg-gradient-to-r from-transparent via-ink-border to-transparent ${className}`.trim()}
  />
);

/* ── Skeleton ────────────────────────────────────────────────────────────── */

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`skeleton rounded-lg bg-ink-elevated ${className}`.trim()} />
);
