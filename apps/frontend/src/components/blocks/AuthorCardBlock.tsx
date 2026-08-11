import React from 'react';
import { ExternalLinkIcon } from '../ui/Icon';

export interface AuthorCardBlockProps {
  name?: string;
  title?: string;
  bio?: string;
  orcid?: string;
  scholar?: string;
  linkedin?: string;
  website?: string;
  avatarUrl?: string;
  expertise?: string[];
}

export const AuthorCardBlock: React.FC<AuthorCardBlockProps> = ({
  name = 'Sandip Thapa',
  title = 'Legal Scholar & Disability Rights Researcher',
  bio = 'Specializing in legal research, UN CRPD harmonization, inclusive education, and accessible digital standards in Nepal.',
  orcid,
  scholar,
  linkedin,
  website,
  avatarUrl,
  expertise = [],
}) => (
  <aside className="bg-ink-elevated border border-ink-border rounded-2xl p-6 space-y-5 shadow-xl shadow-black/20">
    {/* Avatar + Name */}
    <div className="flex items-center gap-4">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${name} profile photo`}
          className="w-14 h-14 rounded-full object-cover border-2 border-gold/50 shadow-md"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/80 to-gold flex items-center justify-center font-serif-display font-bold text-xl text-ink shadow-md">
          {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
      )}
      <div>
        <p className="font-serif-display font-semibold text-ink-100 text-sm">{name}</p>
        <p className="text-[11px] text-gold font-semibold leading-snug">{title}</p>
      </div>
    </div>

    {/* Bio */}
    {bio && (
      <p className="text-xs text-ink-400 leading-relaxed">{bio}</p>
    )}

    {/* Expertise Tags */}
    {expertise.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {expertise.map((tag, i) => (
          <span key={i} className="px-2 py-0.5 bg-ink text-gold text-[10px] font-semibold rounded border border-ink-border">
            {tag}
          </span>
        ))}
      </div>
    )}

    {/* Social/Academic Links */}
    <div className="space-y-2 pt-1">
      {orcid && (
        <a
          href={orcid}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[11px] text-ink-400 hover:text-emerald-400 transition-colors"
        >
          <span className="w-5 h-5 bg-emerald-700/30 rounded flex items-center justify-center text-[9px] font-black text-emerald-300">ID</span>
          ORCID Profile
        </a>
      )}
      {scholar && (
        <a
          href={scholar}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[11px] text-ink-400 hover:text-sky-400 transition-colors"
        >
          <span className="w-5 h-5 bg-blue-700/30 rounded flex items-center justify-center text-[9px] font-black text-blue-300">GS</span>
          Google Scholar
        </a>
      )}
      {linkedin && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[11px] text-ink-400 hover:text-gold transition-colors"
        >
          <span className="w-5 h-5 bg-gold/15 rounded flex items-center justify-center text-[9px] font-black text-gold">in</span>
          LinkedIn
        </a>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[11px] text-ink-400 hover:text-ink-100 transition-colors"
        >
          <span className="w-5 h-5 bg-ink-border/60 rounded flex items-center justify-center text-ink-100"><ExternalLinkIcon className="text-[10px]" /></span>
          Personal Website
        </a>
      )}
    </div>
  </aside>
);
