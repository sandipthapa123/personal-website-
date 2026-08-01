'use client';

import React, { useState } from 'react';

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
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg my-6 text-sm text-slate-700 dark:text-slate-200">
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all ${
            liked ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700'
          }`}
        >
          ❤️ {liked ? 'Liked' : 'Like'} ({likes.toLocaleString()})
        </button>
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all ${
            bookmarked ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700'
          }`}
        >
          🔖 {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>📝 {wordCount.toLocaleString()} words</span>
        <span>🧠 {difficulty}</span>
      </div>
    </div>
  );
};
