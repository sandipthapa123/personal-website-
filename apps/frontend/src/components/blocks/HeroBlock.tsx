import React from 'react';

export interface HeroBlockProps {
  headline?: string;
  subheadline?: string;
  avatarUrl?: string;
  ctaPrimary?: { text: string; url: string };
  ctaSecondary?: { text: string; url: string };
}

export const HeroBlock: React.FC<HeroBlockProps> = ({
  headline = 'Welcome to my Platform',
  subheadline = 'Senior Software Architect & Researcher',
  avatarUrl,
  ctaPrimary,
  ctaSecondary,
}) => {
  return (
    <section className="py-16 px-4 max-w-5xl mx-auto text-center space-y-6">
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="Profile Avatar"
          className="w-28 h-28 mx-auto rounded-full shadow-lg border-2 border-sky-500 object-cover"
        />
      )}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
        {headline}
      </h1>
      {subheadline && (
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
          {subheadline}
        </p>
      )}
      <div className="pt-4 flex flex-wrap justify-center gap-4">
        {ctaPrimary && (
          <a
            href={ctaPrimary.url}
            className="px-6 py-3 font-semibold bg-sky-600 text-white rounded-lg shadow-md hover:bg-sky-700 transition-colors focus-visible:ring"
          >
            {ctaPrimary.text}
          </a>
        )}
        {ctaSecondary && (
          <a
            href={ctaSecondary.url}
            className="px-6 py-3 font-semibold bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-visible:ring"
          >
            {ctaSecondary.text}
          </a>
        )}
      </div>
    </section>
  );
};
