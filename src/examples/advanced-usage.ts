import { YouTubeDataService } from '../services/youtube.js';

async function demonstrateAllFeatures() {
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

  console.log('=== YouTube Data Service - Advanced Features Demo ===\n');

  try {
    console.log('1. Fetching trending videos from January 2024');
    console.log('   Using date range filters with medium obfuscation...\n');

    const trendingVideos = await service.fetchVideosInDateRange({
      publishedAfter: '2024-01-01T00:00:00Z',
      publishedBefore: '2024-01-31T23:59:59Z',
      maxResults: 5,
      obfuscationLevel: 'medium',
    });

    console.log(`   Found ${trendingVideos.length} trending videos\n`);

    trendingVideos.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.title}`);
      console.log(`      Obfuscated: ${video.obfuscatedTitle}`);
      console.log(`      Views: ${video.viewCount.toLocaleString()}`);
      console.log(`      Likes: ${video.likeCount.toLocaleString()}`);
      console.log(`      Heat Score: ${video.heatScore.toFixed(2)}`);
      console.log(`      URL: ${video.url}\n`);
    });

    console.log('2. Testing cache effectiveness (same query)');
    console.log('   This should return cached results instantly...\n');

    const startTime = Date.now();
    await service.fetchVideosInDateRange({
      publishedAfter: '2024-01-01T00:00:00Z',
      publishedBefore: '2024-01-31T23:59:59Z',
      maxResults: 5,
      obfuscationLevel: 'medium',
    });
    const duration = Date.now() - startTime;

    console.log(`   Retrieved from cache in ${duration}ms\n`);

    console.log('3. Keyword search with low obfuscation');
    console.log('   Searching for "machine learning"...\n');

    const searchResults = await service.searchVideosByKeyword({
      query: 'machine learning',
      maxResults: 3,
      obfuscationLevel: 'low',
    });

    console.log(`   Found ${searchResults.length} results\n`);

    searchResults.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.title}`);
      console.log(`      Obfuscated: ${video.obfuscatedTitle}`);
      console.log(`      Published: ${new Date(video.publishedAt).toLocaleDateString()}`);
      console.log(`      Heat Score: ${video.heatScore.toFixed(2)}\n`);
    });

    console.log('4. Testing different obfuscation levels');
    const sampleTitle = 'The Best Ultimate Tutorial Video for New Beginners';

    console.log(`   Original: "${sampleTitle}"`);

    console.log('5. Cache statistics');
    const cacheStats = service.getCacheStats();
    console.log(`   Cache size: ${cacheStats.size}/${cacheStats.max}`);

    console.log('\n6. Quota usage');
    const quotaUsage = service.getQuotaUsage();
    console.log(`   Used: ${quotaUsage.used}/${quotaUsage.limit}`);
    console.log(`   Resets at: ${quotaUsage.resetTime}`);

    console.log('\n7. Demonstrating error handling');
    try {
      const limitedService = new YouTubeDataService({
        apiKey,
        rateLimitOptions: {
          quotaLimit: 0,
        },
      });

      await limitedService.searchVideosByKeyword({
        query: 'test',
      });
    } catch (error: any) {
      console.log(`   Expected error caught: ${error.message}`);
    }

    console.log('\n8. Clearing cache');
    service.clearCache();
    const newStats = service.getCacheStats();
    console.log(`   Cache size after clear: ${newStats.size}/${newStats.max}`);

    console.log('\n=== Demo Complete ===');
  } catch (error: any) {
    console.error('\n❌ Error occurred:', error.message);

    if (error.message.includes('quota')) {
      console.error('   This is a quota limit error. Check your API usage.');
    } else if (error.message.includes('API key')) {
      console.error('   Please set YOUTUBE_API_KEY environment variable.');
    } else {
      console.error('   This might be a network or API error.');
    }
  }
}

demonstrateAllFeatures();
