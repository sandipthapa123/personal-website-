import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-surface text-bodyText">
      <div className="max-w-3xl space-y-6">
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-600 bg-sky-100 rounded-full dark:bg-sky-950 dark:text-sky-400">
          Phase 1 Monorepo Active
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Platform-Driven Engine CMS
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Powered by NestJS backend engines, Next.js dynamic isomorphic rendering client, normalized Prisma database schema, and WCAG 2.2 AAA accessibility controls.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <a
            href="http://localhost:4000/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg shadow-sm hover:opacity-90 transition-all focus-visible:ring"
          >
            Explore API Specs (/api/docs)
          </a>
        </div>
      </div>
    </div>
  );
}
