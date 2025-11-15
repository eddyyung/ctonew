'use client';

import { useState, FormEvent } from 'react';
import { format } from 'date-fns';
import BubbleChart from './BubbleChart';
import TopVideosList from './TopVideosList';

interface BubbleData {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  metadata: {
    channelTitle: string;
    publishedAt: string;
    comments: number;
    views: number;
    likes: number;
  };
}

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

interface TrendingResponse {
  range: {
    startDate: string;
    endDate: string;
  };
  bubbleSeries: {
    axes: {
      x: string;
      y: string;
      radius: string;
    };
    data: BubbleData[];
  };
  topVideos: TopVideo[];
}

export default function TrendingDashboard() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrendingResponse | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError('Both start date and end date are required.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError('End date must be on or after start date.');
      return;
    }

    const diffDays = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays > 31) {
      setError('Date range cannot exceed 31 days.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/trending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch trending data');
      }

      const result: TrendingResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    return format(new Date(), 'yyyy-MM-dd');
  };

  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Trending Analytics Dashboard
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={getTodayDate()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                aria-label="Select start date"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={getTodayDate()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                aria-label="Select end date"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Fetch trending data"
            >
              {loading ? 'Loading...' : 'Fetch Trending Data'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStartDate(getDefaultStartDate());
                setEndDate(getTodayDate());
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              aria-label="Use last 7 days"
            >
              Last 7 Days
            </button>
          </div>

          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
              role="alert"
            >
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </form>
      </div>

      {data && (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Hot Topics Visualization
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Date Range: {format(new Date(data.range.startDate), 'MMM dd, yyyy')} -{' '}
              {format(new Date(data.range.endDate), 'MMM dd, yyyy')}
            </p>
            {data.bubbleSeries.data.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg">No trending videos found for this date range.</p>
                <p className="text-sm mt-2">Try selecting a different date range.</p>
              </div>
            ) : (
              <BubbleChart data={data.bubbleSeries.data} />
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Top 10 Trending Videos
            </h3>
            {data.topVideos.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No videos available.</p>
              </div>
            ) : (
              <TopVideosList videos={data.topVideos} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
