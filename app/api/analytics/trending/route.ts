import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session-server';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 31;

const dateRangeSchema = z
  .object({
    startDate: z.string().datetime({ message: 'startDate must be a valid ISO date.' }),
    endDate: z.string().datetime({ message: 'endDate must be a valid ISO date.' }),
  })
  .superRefine((data, ctx) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate < startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endDate must be on or after startDate.',
        path: ['endDate'],
      });
    }

    const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / ONE_DAY_MS);
    if (diffDays > MAX_RANGE_DAYS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Date range cannot exceed ${MAX_RANGE_DAYS} days.`,
        path: ['endDate'],
      });
    }
  });

interface Video {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  trendingSince: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  keywords: string[];
}

// Sample data for trending videos
const SAMPLE_VIDEOS: Video[] = [
  {
    id: 'vid-001',
    title: 'Epic Space Adventure',
    channelTitle: 'Galactic Films',
    publishedAt: '2024-09-11T14:30:00Z',
    duration: 'PT12M30S',
    trendingSince: '2024-10-01T00:00:00Z',
    metrics: { views: 1250000, likes: 45000, comments: 3200, shares: 8100 },
    keywords: ['space', 'adventure', 'science fiction'],
  },
  {
    id: 'vid-002',
    title: 'Street Food Journey: Bangkok',
    channelTitle: 'Global Palate',
    publishedAt: '2024-08-21T09:05:00Z',
    duration: 'PT18M45S',
    trendingSince: '2024-10-02T00:00:00Z',
    metrics: { views: 980000, likes: 38000, comments: 2800, shares: 6200 },
    keywords: ['food', 'travel', 'bangkok'],
  },
  {
    id: 'vid-003',
    title: 'Top 10 Coding Interview Tips',
    channelTitle: 'DevBoost',
    publishedAt: '2024-07-05T16:00:00Z',
    duration: 'PT10M12S',
    trendingSince: '2024-10-03T00:00:00Z',
    metrics: { views: 1620000, likes: 52000, comments: 4300, shares: 9100 },
    keywords: ['coding', 'interview', 'software'],
  },
  {
    id: 'vid-004',
    title: 'Meditation for Beginners',
    channelTitle: 'Calm Minds',
    publishedAt: '2024-06-30T07:30:00Z',
    duration: 'PT15M00S',
    trendingSince: '2024-10-04T00:00:00Z',
    metrics: { views: 870000, likes: 47000, comments: 5100, shares: 7200 },
    keywords: ['meditation', 'wellness', 'mindfulness'],
  },
  {
    id: 'vid-005',
    title: 'Electric Cars Explained',
    channelTitle: 'Tech Horizon',
    publishedAt: '2024-09-02T11:45:00Z',
    duration: 'PT14M22S',
    trendingSince: '2024-10-05T00:00:00Z',
    metrics: { views: 1450000, likes: 61000, comments: 4900, shares: 8600 },
    keywords: ['electric cars', 'technology', 'innovation'],
  },
  {
    id: 'vid-006',
    title: 'Morning Yoga Flow',
    channelTitle: 'Flex & Flow',
    publishedAt: '2024-08-14T05:20:00Z',
    duration: 'PT20M00S',
    trendingSince: '2024-10-06T00:00:00Z',
    metrics: { views: 780000, likes: 34000, comments: 2600, shares: 5800 },
    keywords: ['yoga', 'fitness', 'wellness'],
  },
  {
    id: 'vid-007',
    title: 'AI Art Challenge',
    channelTitle: 'Creative Coders',
    publishedAt: '2024-09-18T18:15:00Z',
    duration: 'PT08M10S',
    trendingSince: '2024-10-07T00:00:00Z',
    metrics: { views: 1190000, likes: 54000, comments: 4100, shares: 7800 },
    keywords: ['ai', 'art', 'challenge'],
  },
  {
    id: 'vid-008',
    title: 'Plant-Based Meal Prep',
    channelTitle: 'Kitchen Roots',
    publishedAt: '2024-09-09T12:50:00Z',
    duration: 'PT16M05S',
    trendingSince: '2024-10-08T00:00:00Z',
    metrics: { views: 1050000, likes: 48000, comments: 3900, shares: 6900 },
    keywords: ['vegan', 'cooking', 'meal prep'],
  },
  {
    id: 'vid-009',
    title: 'Wildlife Documentary: Amazon',
    channelTitle: 'Nature Vault',
    publishedAt: '2024-07-19T21:00:00Z',
    duration: 'PT25M40S',
    trendingSince: '2024-10-09T00:00:00Z',
    metrics: { views: 1730000, likes: 72000, comments: 6100, shares: 10100 },
    keywords: ['wildlife', 'documentary', 'amazon'],
  },
  {
    id: 'vid-010',
    title: 'DIY Smart Home Gadgets',
    channelTitle: 'Maker Hive',
    publishedAt: '2024-08-01T10:05:00Z',
    duration: 'PT13M17S',
    trendingSince: '2024-10-10T00:00:00Z',
    metrics: { views: 960000, likes: 35000, comments: 2750, shares: 6400 },
    keywords: ['diy', 'smart home', 'gadgets'],
  },
  {
    id: 'vid-011',
    title: 'Mountain Biking Challenge',
    channelTitle: 'Trail Blazers',
    publishedAt: '2024-09-12T15:40:00Z',
    duration: 'PT19M33S',
    trendingSince: '2024-10-11T00:00:00Z',
    metrics: { views: 1380000, likes: 59000, comments: 4300, shares: 8700 },
    keywords: ['mountain biking', 'sports', 'adventure'],
  },
  {
    id: 'vid-012',
    title: 'Live Jazz Session',
    channelTitle: 'Sound Lounge',
    publishedAt: '2024-06-28T22:20:00Z',
    duration: 'PT45M00S',
    trendingSince: '2024-10-12T00:00:00Z',
    metrics: { views: 680000, likes: 31000, comments: 2400, shares: 5300 },
    keywords: ['jazz', 'music', 'live'],
  },
];

function obfuscateTitle(title: string): string {
  const commonNouns = [
    'video',
    'tutorial',
    'guide',
    'tips',
    'tricks',
    'review',
    'explained',
    'challenge',
  ];
  const commonAdjectives = [
    'best',
    'top',
    'amazing',
    'awesome',
    'ultimate',
    'complete',
    'perfect',
    'easy',
  ];

  let obfuscated = title;

  commonNouns.forEach((noun) => {
    const regex = new RegExp(`\\b${noun}\\b`, 'gi');
    obfuscated = obfuscated.replace(regex, '[***]');
  });

  commonAdjectives.forEach((adj) => {
    const regex = new RegExp(`\\b${adj}\\b`, 'gi');
    obfuscated = obfuscated.replace(regex, '[*]');
  });

  return obfuscated;
}

function isWithinRange(video: Video, startDate: Date, endDate: Date): boolean {
  const trendingDate = new Date(video.trendingSince);
  if (Number.isNaN(trendingDate.getTime())) {
    return false;
  }
  return trendingDate >= startDate && trendingDate <= endDate;
}

function getTrendingVideos(startDate: Date, endDate: Date): Video[] {
  return SAMPLE_VIDEOS.filter((video) => isWithinRange(video, startDate, endDate));
}

function buildBubbleSeries(videos: Video[]) {
  return videos.map((video) => ({
    id: video.id,
    label: video.title,
    x: video.metrics.views,
    y: video.metrics.likes,
    radius: Math.max(6, Math.round(Math.sqrt((video.metrics.comments || 0) + 1))),
    metadata: {
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      comments: video.metrics.comments,
      views: video.metrics.views,
      likes: video.metrics.likes,
    },
  }));
}

function buildTopVideos(videos: Video[]) {
  return videos.slice(0, 10).map((video, index) => ({
    rank: index + 1,
    id: video.id,
    title: video.title,
    obfuscatedTitle: obfuscateTitle(video.title),
    channelTitle: video.channelTitle,
    publishedAt: video.publishedAt,
    duration: video.duration,
    metrics: video.metrics,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.isAuthenticated) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'API key required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = dateRangeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'Invalid date range payload.',
          details: parseResult.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { startDate: startDateStr, endDate: endDateStr } = parseResult.data;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const videos = getTrendingVideos(startDate, endDate);

    const sortedVideos = [...videos].sort((a, b) => {
      if (b.metrics.views !== a.metrics.views) {
        return b.metrics.views - a.metrics.views;
      }
      return b.metrics.likes - a.metrics.likes;
    });

    const bubbleSeries = buildBubbleSeries(sortedVideos);
    const topVideos = buildTopVideos(sortedVideos);

    return NextResponse.json({
      range: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      bubbleSeries: {
        axes: {
          x: 'views',
          y: 'likes',
          radius: 'comments',
        },
        data: bubbleSeries,
      },
      topVideos,
    });
  } catch (error) {
    console.error('Error in trending API:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Unable to retrieve trending analytics at this time.',
      },
      { status: 500 }
    );
  }
}
