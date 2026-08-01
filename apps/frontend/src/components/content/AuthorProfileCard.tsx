import React from 'react';

export interface AuthorProfileCardProps {
  name?: string;
  position?: string;
  avatarUrl?: string;
  bio?: string;
  orcid?: string;
  googleScholar?: string;
  researchGate?: string;
  linkedIn?: string;
  website?: string;
}

export const AuthorProfileCard: React.FC<AuthorProfileCardProps> = ({
  name = 'Sandip Thapa',
  position = 'Senior Software Architect & Academic Researcher',
  avatarUrl = '/media/sandip-avatar.jpg',
  bio = 'Specializing in enterprise platform architectures, human rights law, accessibility standards (WCAG 2.2 AAA), and scalable web systems.',
  orcid = '0000-0002-1234-5678',
  googleScholar = 'https://scholar.google.com',
  researchGate = 'https://researchgate.net',
  linkedIn = 'https://linkedin.com/in/sandipthapa',
  website = 'https://thapasandip.com.np',
}) => {
  return (
    <aside className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl my-8 flex flex-col sm:flex-row gap-5 items-start">
      <div className="w-20 h-20 rounded-full bg-sky-600 text-white font-extrabold text-2xl flex items-center justify-center flex-shrink-0 shadow-md">
        ST
      </div>
      <div className="space-y-3 flex-grow text-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{name}</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 mt-0.5">{position}</p>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{bio}</p>
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          {orcid && (
            <a href={`https://orcid.org/${orcid}`} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md font-semibold">
              ORCID: {orcid}
            </a>
          )}
          {googleScholar && (
            <a href={googleScholar} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 rounded-md font-semibold">
              Google Scholar
            </a>
          )}
          {linkedIn && (
            <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-md font-semibold">
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </aside>
  );
};
