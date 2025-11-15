import { YouTubeDataService } from '../services/youtube.js';

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';

  const service = new YouTubeDataService({
    apiKey,
    cacheOptions: {
      max: 100,
      ttl: 1000 * 60 * 15,
    },
    rateLimitOptions: {
      maxConcurrent: 5,
      quotaLimit: 10000,
    },
  });

  try {
    console.log('=== Fetching videos in date range ===');
    const dateRangeVideos = await service.fetchVideosInDateRange({
      publishedAfter: '2024-01-01T00:00:00Z',
      publishedBefore: '2024-01-31T23:59:59Z',
      maxResults: 10,
      obfuscationLevel: 'medium',
    });

    console.log(`Found ${dateRangeVideos.length} videos`);
    dateRangeVideos.slice(0, 3).forEach((video) => {
      console.log({
        title: video.title,
        obfuscated: video.obfuscatedTitle,
        views: video.viewCount,
        likes: video.likeCount,
        heat: video.heatScore.toFixed(2),
      });
    });

    console.log('\n=== Testing cache (should hit cache) ===');
    const cachedVideos = await service.fetchVideosInDateRange({
      publishedAfter: '2024-01-01T00:00:00Z',
      publishedBefore: '2024-01-31T23:59:59Z',
      maxResults: 10,
      obfuscationLevel: 'medium',
    });
    console.log(`Retrieved ${cachedVideos.length} videos from cache`);

    console.log('\n=== Searching videos by keyword ===');
    const searchResults = await service.searchVideosByKeyword({
      query: 'javascript tutorial',
      maxResults: 5,
      obfuscationLevel: 'low',
    });

    console.log(`Found ${searchResults.length} search results`);
    searchResults.forEach((video) => {
      console.log({
        title: video.title,
        obfuscated: video.obfuscatedTitle,
        url: video.url,
        heat: video.heatScore.toFixed(2),
      });
    });

    console.log('\n=== Cache Statistics ===');
    console.log(service.getCacheStats());

    console.log('\n=== Quota Usage ===');
    console.log(service.getQuotaUsage());
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

main();
