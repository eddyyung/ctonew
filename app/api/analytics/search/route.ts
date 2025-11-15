import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session-server';

const MAX_KEYWORD_LENGTH = 100;
const MIN_KEYWORD_LENGTH = 2;
const MAX_RESULTS = 10;

const searchSchema = z.object({
  keyword: z
    .string()
    .min(MIN_KEYWORD_LENGTH, `Keyword must be at least ${MIN_KEYWORD_LENGTH} characters long.`)
    .max(MAX_KEYWORD_LENGTH, `Keyword cannot exceed ${MAX_KEYWORD_LENGTH} characters.`)
    .trim(),
  sortBy: z.enum(['views', 'likes']).optional().default('views'),
});

interface Video {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  trendingSince: string;
  description: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  keywords: string[];
}

// Sample data for search videos (extended from trending data with descriptions)
const SAMPLE_VIDEOS: Video[] = [
  {
    id: 'vid-001',
    title: 'Epic Space Adventure',
    channelTitle: 'Galactic Films',
    publishedAt: '2024-09-11T14:30:00Z',
    duration: 'PT12M30S',
    trendingSince: '2024-10-01T00:00:00Z',
    description: 'Join us on an incredible journey through the cosmos as we explore distant galaxies and discover new worlds.',
    metrics: { views: 1250000, likes: 45000, comments: 3200, shares: 8100 },
    keywords: ['space', 'adventure', 'science fiction', 'galaxy', 'stars'],
  },
  {
    id: 'vid-002',
    title: 'Street Food Journey: Bangkok',
    channelTitle: 'Global Palate',
    publishedAt: '2024-08-21T09:05:00Z',
    duration: 'PT18M45S',
    trendingSince: '2024-10-02T00:00:00Z',
    description: 'Experience the vibrant street food scene in Bangkok, from spicy noodles to sweet desserts.',
    metrics: { views: 980000, likes: 38000, comments: 2800, shares: 6200 },
    keywords: ['food', 'travel', 'bangkok', 'street food', 'thailand'],
  },
  {
    id: 'vid-003',
    title: 'Top 10 Coding Interview Tips',
    channelTitle: 'DevBoost',
    publishedAt: '2024-07-05T16:00:00Z',
    duration: 'PT10M12S',
    trendingSince: '2024-10-03T00:00:00Z',
    description: 'Master your next coding interview with these essential tips and strategies for success.',
    metrics: { views: 1620000, likes: 52000, comments: 4300, shares: 9100 },
    keywords: ['coding', 'interview', 'software', 'programming', 'tech'],
  },
  {
    id: 'vid-004',
    title: 'Meditation for Beginners',
    channelTitle: 'Calm Minds',
    publishedAt: '2024-06-30T07:30:00Z',
    duration: 'PT15M00S',
    trendingSince: '2024-10-04T00:00:00Z',
    description: 'Learn the basics of meditation and start your journey to mindfulness and inner peace.',
    metrics: { views: 870000, likes: 47000, comments: 5100, shares: 7200 },
    keywords: ['meditation', 'wellness', 'mindfulness', 'relaxation', 'health'],
  },
  {
    id: 'vid-005',
    title: 'Electric Cars Explained',
    channelTitle: 'Tech Horizon',
    publishedAt: '2024-09-02T11:45:00Z',
    duration: 'PT14M22S',
    trendingSince: '2024-10-05T00:00:00Z',
    description: 'Everything you need to know about electric vehicles, from technology to environmental impact.',
    metrics: { views: 1450000, likes: 61000, comments: 4900, shares: 8600 },
    keywords: ['electric cars', 'technology', 'innovation', 'automotive', 'sustainability'],
  },
  {
    id: 'vid-006',
    title: 'Morning Yoga Flow',
    channelTitle: 'Flex & Flow',
    publishedAt: '2024-08-14T05:20:00Z',
    duration: 'PT20M00S',
    trendingSince: '2024-10-06T00:00:00Z',
    description: 'Start your day with this energizing yoga flow designed for all skill levels.',
    metrics: { views: 780000, likes: 34000, comments: 2600, shares: 5800 },
    keywords: ['yoga', 'fitness', 'wellness', 'exercise', 'morning routine'],
  },
  {
    id: 'vid-007',
    title: 'AI Art Challenge',
    channelTitle: 'Creative Coders',
    publishedAt: '2024-09-18T18:15:00Z',
    duration: 'PT08M10S',
    trendingSince: '2024-10-07T00:00:00Z',
    description: 'Watch as artists compete in an AI art challenge, pushing the boundaries of digital creativity.',
    metrics: { views: 1190000, likes: 54000, comments: 4100, shares: 7800 },
    keywords: ['ai', 'art', 'challenge', 'digital art', 'creativity'],
  },
  {
    id: 'vid-008',
    title: 'Plant-Based Meal Prep',
    channelTitle: 'Kitchen Roots',
    publishedAt: '2024-09-09T12:50:00Z',
    duration: 'PT16M05S',
    trendingSince: '2024-10-08T00:00:00Z',
    description: 'Prepare delicious plant-based meals for the entire week with these simple recipes.',
    metrics: { views: 1050000, likes: 48000, comments: 3900, shares: 6900 },
    keywords: ['vegan', 'cooking', 'meal prep', 'plant-based', 'healthy'],
  },
  {
    id: 'vid-009',
    title: 'Wildlife Documentary: Amazon',
    channelTitle: 'Nature Vault',
    publishedAt: '2024-07-19T21:00:00Z',
    duration: 'PT25M40S',
    trendingSince: '2024-10-09T00:00:00Z',
    description: 'Explore the incredible biodiversity of the Amazon rainforest and its wildlife.',
    metrics: { views: 1730000, likes: 72000, comments: 6100, shares: 10100 },
    keywords: ['wildlife', 'documentary', 'amazon', 'nature', 'conservation'],
  },
  {
    id: 'vid-010',
    title: 'DIY Smart Home Gadgets',
    channelTitle: 'Maker Hive',
    publishedAt: '2024-08-01T10:05:00Z',
    duration: 'PT13M17S',
    trendingSince: '2024-10-10T00:00:00Z',
    description: 'Build your own smart home gadgets with these easy DIY projects and tutorials.',
    metrics: { views: 960000, likes: 35000, comments: 2750, shares: 6400 },
    keywords: ['diy', 'smart home', 'gadgets', 'technology', 'home automation'],
  },
  {
    id: 'vid-011',
    title: 'Mountain Biking Challenge',
    channelTitle: 'Trail Blazers',
    publishedAt: '2024-09-12T15:40:00Z',
    duration: 'PT19M33S',
    trendingSince: '2024-10-11T00:00:00Z',
    description: 'Take on the ultimate mountain biking challenge through rugged terrain and stunning landscapes.',
    metrics: { views: 1380000, likes: 59000, comments: 4300, shares: 8700 },
    keywords: ['mountain biking', 'sports', 'adventure', 'outdoors', 'cycling'],
  },
  {
    id: 'vid-012',
    title: 'Live Jazz Session',
    channelTitle: 'Sound Lounge',
    publishedAt: '2024-06-28T22:20:00Z',
    duration: 'PT45M00S',
    trendingSince: '2024-10-12T00:00:00Z',
    description: 'Enjoy an intimate live jazz session featuring talented musicians from around the world.',
    metrics: { views: 680000, likes: 31000, comments: 2400, shares: 5300 },
    keywords: ['jazz', 'music', 'live', 'performance', 'concert'],
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

function truncateDescription(description: string, maxLength: number = 150): string {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength).trim() + '...';
}

function searchVideos(keyword: string, sortBy: 'views' | 'likes'): Video[] {
  const searchTerm = keyword.toLowerCase();
  
  const matchingVideos = SAMPLE_VIDEOS.filter((video) => {
    // Search in title, description, channel, and keywords
    const titleMatch = video.title.toLowerCase().includes(searchTerm);
    const descriptionMatch = video.description.toLowerCase().includes(searchTerm);
    const channelMatch = video.channelTitle.toLowerCase().includes(searchTerm);
    const keywordsMatch = video.keywords.some((kw) => kw.toLowerCase().includes(searchTerm));
    
    return titleMatch || descriptionMatch || channelMatch || keywordsMatch;
  });

  // Sort by the specified metric
  const sortedVideos = [...matchingVideos].sort((a, b) => {
    const metricA = sortBy === 'views' ? a.metrics.views : a.metrics.likes;
    const metricB = sortBy === 'views' ? b.metrics.views : b.metrics.likes;
    return metricB - metricA;
  });

  return sortedVideos.slice(0, MAX_RESULTS);
}

function buildSearchResults(videos: Video[]) {
  return videos.map((video) => ({
    id: video.id,
    title: video.title,
    obfuscatedTitle: obfuscateTitle(video.title),
    description: truncateDescription(video.description),
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
    const parseResult = searchSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'Invalid search parameters.',
          details: parseResult.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { keyword, sortBy } = parseResult.data;
    const videos = searchVideos(keyword, sortBy);

    if (videos.length === 0) {
      return NextResponse.json({
        message: 'No videos found for the specified keyword.',
        results: [],
        keyword,
        sortBy,
      });
    }

    const results = buildSearchResults(videos);

    return NextResponse.json({
      message: `Found ${results.length} video(s) matching "${keyword}"`,
      results,
      keyword,
      sortBy,
      totalAvailable: videos.length,
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Unable to perform search at this time.',
      },
      { status: 500 }
    );
  }
}