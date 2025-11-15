'use client';

import { useState, FormEvent } from 'react';
import { format } from 'date-fns';
import { Loader2, Search, AlertCircle, TrendingUp, Heart } from 'lucide-react';

interface SearchVideo {
  id: string;
  title: string;
  obfuscatedTitle: string;
  description: string;
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

interface SearchResponse {
  message: string;
  results: SearchVideo[];
  keyword: string;
  sortBy: 'views' | 'likes';
  totalAvailable: number;
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

// Loading skeleton component
function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-800">
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2 dark:bg-gray-600"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 dark:bg-gray-600"></div>
                <div className="h-4 bg-gray-300 rounded w-full dark:bg-gray-600"></div>
              </div>
              <div className="h-8 w-8 bg-gray-300 rounded ml-4 dark:bg-gray-600"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="h-4 bg-gray-300 rounded w-16 dark:bg-gray-600"></div>
                <div className="h-4 bg-gray-300 rounded w-16 dark:bg-gray-600"></div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-24 dark:bg-gray-600"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function KeywordSearch() {
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'likes'>('views');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [revealedTitles, setRevealedTitles] = useState<Set<string>>(new Set());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      setError('Please enter a search keyword.');
      return;
    }

    if (trimmedKeyword.length < 2) {
      setError('Keyword must be at least 2 characters long.');
      return;
    }

    if (trimmedKeyword.length > 100) {
      setError('Keyword cannot exceed 100 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: trimmedKeyword,
          sortBy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'rate_limited') {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(errorData.message || 'Failed to search videos');
      }

      const result: SearchResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

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

  const clearSearch = () => {
    setKeyword('');
    setData(null);
    setError(null);
    setRevealedTitles(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Keyword Search
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="keyword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Search Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keywords to search videos..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                maxLength={100}
                aria-label="Search keyword"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {keyword.length}/100 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="sortBy"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Sort By
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="sortBy"
                  value="views"
                  checked={sortBy === 'views'}
                  onChange={(e) => setSortBy(e.target.value as 'views' | 'likes')}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Views
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="sortBy"
                  value="likes"
                  checked={sortBy === 'likes'}
                  onChange={(e) => setSortBy(e.target.value as 'views' | 'likes')}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Likes
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              aria-label="Search videos"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </button>

            {data && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>

          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {loading && <SearchSkeleton />}

      {data && !loading && (
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Search Results
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.message} • Sorted by {data.sortBy}
            </p>
          </div>

          {data.results.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="flex flex-col items-center gap-4">
                <Search className="h-12 w-12 text-gray-300" />
                <div>
                  <p className="text-lg font-medium">No videos found</p>
                  <p className="text-sm mt-2">
                    Try adjusting your keywords or search terms
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {data.results.map((video) => {
                const isRevealed = revealedTitles.has(video.id);
                const displayTitle = isRevealed ? video.title : video.obfuscatedTitle;

                return (
                  <div
                    key={video.id}
                    className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 mr-4">
                        <div
                          className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors group relative mb-2"
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {video.description}
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {video.channelTitle} • {format(new Date(video.publishedAt), 'MMM dd, yyyy')} • {parseDuration(video.duration)}
                        </div>
                      </div>
                      <a
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex-shrink-0"
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
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-6">
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>{formatNumber(video.metrics.views)}</strong> views
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>{formatNumber(video.metrics.likes)}</strong> likes
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>{formatNumber(video.metrics.comments)}</strong> comments
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {data.results.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Tip:</strong> Click on any video title to toggle between obfuscated and original
                titles. Click the YouTube icon to open the video in a new tab.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}