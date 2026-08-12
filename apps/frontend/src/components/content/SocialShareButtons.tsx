'use client';

import React, { useState } from 'react';
import { ACCESSIBILITY_CONSTANTS } from '@cms/accessibility';
import { CheckIcon, CopyIcon } from '../ui/Icon';

export interface SocialShareButtonsProps {
  title: string;
  url: string;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'X (Twitter)', url: `https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}` },
    { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: 'Bluesky', url: `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}` },
    { name: 'Reddit', url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}` },
    { name: 'WhatsApp', url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}` },
    { name: 'Telegram', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
    { name: 'Email', url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}` },
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
    <div className="py-6 border-y border-ink-border my-8 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-400">
        Share Article &amp; Research
      </h3>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${platform.name}`}
            className="px-3.5 py-2 text-xs font-semibold text-ink-100 bg-ink-elevated border border-ink-border rounded-md shadow-sm transition-colors hover:border-gold-text/50 hover:text-gold-text"
          >
            {platform.name}
          </a>
        ))}
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label="Copy article link to clipboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-gold text-onGold rounded-md shadow-sm hover:brightness-110 transition-all"
        >
          {copied ? (<><CheckIcon className="text-xs" /> Link Copied!</>) : (<><CopyIcon className="text-xs" /> Copy Link</>)}
        </button>
      </div>
    </div>
  );
};
