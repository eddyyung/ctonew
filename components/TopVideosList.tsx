'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface TopVideo {
  rank: number;
  id: string;
  title: string;
  obfuscatedTitle: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

interface TopVideosListProps {
  videos: TopVideo[];
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const parseDuration = (duration: string): string => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function TopVideosList({ videos }: TopVideosListProps) {
  const [revealedTitles, setRevealedTitles] = useState<Set<string>>(new Set());

  const toggleTitleReveal = (videoId: string) => {
    setRevealedTitles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Rank
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Title
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Channel
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Published
            </th>
            <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
              Views
            </th>
            <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
              Likes
            </th>
            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video) => {
            const isRevealed = revealedTitles.has(video.id);
            const displayTitle = isRevealed ? video.title : video.obfuscatedTitle;

            return (
              <tr
                key={video.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-sm">
                    {video.rank}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <div
                      className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors group relative"
                      title={
                        isRevealed
                          ? 'Click to hide original title'
                          : 'Click to reveal original title'
                      }
                      onClick={() => toggleTitleReveal(video.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleTitleReveal(video.id);
                        }
                      }}
                      aria-label={isRevealed ? 'Hide original title' : 'Reveal original title'}
                    >
                      {displayTitle}
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {isRevealed ? '👁️' : '🔒'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Duration: {parseDuration(video.duration)}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                  {video.channelTitle}
                </td>
                <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                  {format(new Date(video.publishedAt), 'MMM dd, yyyy')}
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">
                  {formatNumber(video.metrics.views)}
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">
                  {formatNumber(video.metrics.likes)}
                </td>
                <td className="py-4 px-4 text-center">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label={`Watch ${displayTitle} on YouTube`}
                    title="Watch on YouTube"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Tip:</strong> Click on any video title to toggle between obfuscated and original
          titles. Click the YouTube icon to open the video in a new tab.
        </p>
      </div>
    </div>
  );
}
