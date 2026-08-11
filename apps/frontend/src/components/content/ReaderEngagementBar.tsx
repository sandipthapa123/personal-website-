'use client';

import React, { useState } from 'react';
import { HeartIcon, BookmarkIcon } from '../ui/Icon';

export interface ReaderEngagementBarProps {
  initialLikes?: number;
  initialBookmarks?: number;
  wordCount?: number;
  difficulty?: string;
}

export const ReaderEngagementBar: React.FC<ReaderEngagementBarProps> = ({
  initialLikes = 1248,
  initialBookmarks = 428,
  wordCount = 1450,
  difficulty = 'Intermediate Academic',
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikes((l) => l - 1);
      setLiked(false);
    } else {
      setLikes((l) => l + 1);
      setLiked(true);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-ink-elevated border border-ink-border rounded-xl my-6 text-sm text-ink-100">
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all ${
            liked ? 'bg-rose-600 text-white' : 'bg-ink border border-ink-border hover:border-gold/40'
          }`}
        >
          <HeartIcon className="text-sm" filled={liked} /> {liked ? 'Liked' : 'Like'} ({likes.toLocaleString('en-US')})
        </button>
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all ${
            bookmarked ? 'bg-gold text-ink' : 'bg-ink border border-ink-border hover:border-gold/40'
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
