import React from 'react';

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
  <aside className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
    {/* Avatar + Name */}
    <div className="flex items-center gap-4">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${name} profile photo`}
          className="w-14 h-14 rounded-full object-cover border-2 border-sky-600 shadow-md"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-600 to-indigo-700 flex items-center justify-center font-black text-xl text-white shadow-md">
          {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
      )}
      <div>
        <p className="font-extrabold text-white text-sm">{name}</p>
        <p className="text-[11px] text-sky-400 font-semibold leading-snug">{title}</p>
      </div>
    </div>

    {/* Bio */}
    {bio && (
      <p className="text-xs text-slate-400 leading-relaxed">{bio}</p>
    )}

    {/* Expertise Tags */}
    {expertise.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {expertise.map((tag, i) => (
          <span key={i} className="px-2 py-0.5 bg-slate-800 text-sky-300 text-[10px] font-semibold rounded border border-slate-700">
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
          className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-green-400 transition-colors"
        >
          <span className="w-5 h-5 bg-green-700/40 rounded flex items-center justify-center text-[9px] font-black text-green-300">ID</span>
          ORCID Profile
        </a>
      )}
      {scholar && (
        <a
          href={scholar}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-blue-400 transition-colors"
        >
          <span className="w-5 h-5 bg-blue-700/40 rounded flex items-center justify-center text-[9px] font-black text-blue-300">GS</span>
          Google Scholar
        </a>
      )}
      {linkedin && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-sky-400 transition-colors"
        >
          <span className="w-5 h-5 bg-sky-700/40 rounded flex items-center justify-center text-[9px] font-black text-sky-300">in</span>
          LinkedIn
        </a>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          <span className="w-5 h-5 bg-slate-700/60 rounded flex items-center justify-center text-[9px] font-black text-slate-300">🌐</span>
          Personal Website
        </a>
      )}
    </div>
  </aside>
);
