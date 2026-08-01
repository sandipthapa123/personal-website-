'use client';

import React, { useState } from 'react';
import { ACCESSIBILITY_CONSTANTS } from '@cms/accessibility';

export interface SocialShareButtonsProps {
  title: string;
  url: string;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, bg: 'bg-blue-600' },
    { name: 'X (Twitter)', url: `https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`, bg: 'bg-black' },
    { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, bg: 'bg-sky-700' },
    { name: 'Bluesky', url: `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`, bg: 'bg-sky-500' },
    { name: 'Reddit', url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`, bg: 'bg-orange-600' },
    { name: 'WhatsApp', url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, bg: 'bg-emerald-600' },
    { name: 'Telegram', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, bg: 'bg-blue-500' },
    { name: 'Email', url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`, bg: 'bg-slate-700' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);

    // Announce to screen reader
    const announcer = document.getElementById(ACCESSIBILITY_CONSTANTS.LIVE_ANNOUNCER_ID);
    if (announcer) {
      announcer.textContent = 'Link copied to clipboard successfully!';
    }

    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="py-6 border-y border-slate-200 dark:border-slate-800 my-8 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Share Article & Research
      </h3>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${platform.name}`}
            className={`px-3.5 py-2 text-xs font-semibold text-white rounded-md shadow-sm transition-opacity hover:opacity-90 focus-visible:ring ${platform.bg}`}
          >
            {platform.name}
          </a>
        ))}
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label="Copy article link to clipboard"
          className="px-3.5 py-2 text-xs font-semibold bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded-md shadow-sm hover:opacity-90 transition-opacity focus-visible:ring"
        >
          {copied ? '✓ Link Copied!' : '📋 Copy Link'}
        </button>
      </div>
    </div>
  );
};
