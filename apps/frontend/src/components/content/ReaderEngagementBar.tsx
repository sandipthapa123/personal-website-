'use client';

import React, { useState } from 'react';
import { HeartIcon, BookmarkIcon } from '../ui/Icon';
import { useAnnounce } from '../../hooks/useAnnounce';

export interface ReaderEngagementBarProps {
  initialLikes?: number;
  initialBookmarks?: number;
  wordCount?: number;
  difficulty?: string;
}

export const ReaderEngagementBar: React.FC<ReaderEngagementBarProps> = ({
  initialLikes = 1248,
  wordCount = 1450,
  difficulty = 'Intermediate Academic',
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const announce = useAnnounce();

  const handleLike = () => {
    if (liked) {
      setLikes((l) => l - 1);
      setLiked(false);
      announce('Removed like');
    } else {
      setLikes((l) => l + 1);
      setLiked(true);
      announce('Article liked');
    }
  };

  const handleBookmark = () => {
    setBookmarked((prev) => {
      announce(prev ? 'Bookmark removed' : 'Article bookmarked');
      return !prev;
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-ink-elevated border border-ink-border rounded-xl my-6 text-sm text-ink-100">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleLike}
          aria-pressed={liked}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all ${
            liked ? 'bg-rose-600 text-white' : 'bg-ink border border-ink-border text-ink-100 hover:border-gold-text/50'
          }`}
        >
          <HeartIcon className="text-sm" filled={liked} /> {liked ? 'Liked' : 'Like'} ({likes.toLocaleString('en-US')})
        </button>
        <button
          type="button"
          onClick={handleBookmark}
          aria-pressed={bookmarked}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all ${
            bookmarked ? 'bg-gold text-onGold' : 'bg-ink border border-ink-border text-ink-100 hover:border-gold-text/50'
          }`}
        >
          <BookmarkIcon className="text-sm" filled={bookmarked} /> {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-ink-400">
        <span>{wordCount.toLocaleString('en-US')} words</span>
        <span>{difficulty}</span>
      </div>
    </div>
  );
};
