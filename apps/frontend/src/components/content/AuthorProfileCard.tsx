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
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <aside className="p-6 sm:p-7 bg-ink-elevated border border-ink-border rounded-2xl my-8 flex flex-col sm:flex-row gap-6 items-start shadow-lg shadow-black/20">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`Portrait of ${name}`}
          className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 border-2 border-gold/40 shadow-md"
        />
      ) : (
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold/80 to-gold text-onGold font-serif-display font-bold text-3xl flex items-center justify-center flex-shrink-0 shadow-md">
          {initials}
        </div>
      )}
      <div className="space-y-3 flex-grow text-sm">
        <div>
          <h3 className="font-serif-display text-xl font-semibold text-ink-100 leading-tight">{name}</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-text mt-0.5">{position}</p>
        </div>
        <p className="text-ink-400 leading-relaxed">{bio}</p>
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          {orcid && (
            <a href={`https://orcid.org/${orcid}`} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-successText/10 text-successText border border-successText/30 rounded-md font-semibold hover:border-successText/60 transition-colors">
              ORCID: {orcid}
            </a>
          )}
          {googleScholar && (
            <a href={googleScholar} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-ink text-ink-100 border border-ink-border rounded-md font-semibold hover:border-gold-text/50 hover:text-gold-text transition-colors">
              Google Scholar
            </a>
          )}
          {linkedIn && (
            <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-ink text-ink-100 border border-ink-border rounded-md font-semibold hover:border-gold-text/50 hover:text-gold-text transition-colors">
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </aside>
  );
};
