# YouTube Data Service

A server-side module for interacting with YouTube Data API v3 with built-in caching, rate limiting, and data normalization.

## Features

- **Date Range Queries**: Fetch trending videos within specific date ranges
- **Keyword Search**: Search for videos by keywords with relevance ranking
- **Title Obfuscation**: Configurable title masking (low/medium/high levels)
- **LRU Caching**: In-memory caching to reduce API hits with configurable TTL
- **Rate Limiting**: Request throttling and quota management
- **Heat Score**: Computed metric for bubble sizing based on views and likes
- **Error Handling**: Actionable error messages for quota and network failures

## Installation

```bash
npm install
```

## Configuration

```typescript
import { YouTubeDataService } from './services/youtube';

const service = new YouTubeDataService({
  apiKey: 'YOUR_YOUTUBE_API_KEY',
  cacheOptions: {
    max: 100, // Maximum cache entries
    ttl: 900000, // Cache TTL in milliseconds (15 minutes)
  },
  rateLimitOptions: {
    maxConcurrent: 5, // Max concurrent requests
    quotaLimit: 10000, // Daily quota limit
  },
});
```

## Usage

### Fetch Videos in Date Range

```typescript
const videos = await service.fetchVideosInDateRange({
  publishedAfter: '2024-01-01T00:00:00Z',
  publishedBefore: '2024-01-31T23:59:59Z',
  maxResults: 50,
  obfuscationLevel: 'medium',
});

console.log(videos);
// [
//   {
//     videoId: 'abc123',
//     url: 'https://www.youtube.com/watch?v=abc123',
//     title: 'Amazing Tutorial Video',
//     obfuscatedTitle: '[*] [***] [***]',
//     publishedAt: '2024-01-15T12:00:00Z',
//     viewCount: 1000000,
//     likeCount: 50000,
//     heatScore: 5.234
//   },
//   ...
// ]
```

### Keyword Search

```typescript
const results = await service.searchVideosByKeyword({
  query: 'javascript tutorial',
  maxResults: 10,
  obfuscationLevel: 'low',
});

console.log(results);
// Returns top 10 matching videos with metadata
```

### Cache Management

```typescript
// Get cache statistics
const stats = service.getCacheStats();
console.log(stats); // { size: 10, max: 100 }

// Clear cache
service.clearCache();
```

### Quota Monitoring

```typescript
const quota = service.getQuotaUsage();
console.log(quota);
// {
//   used: 500,
//   limit: 10000,
//   resetTime: '2024-12-01T00:00:00.000Z'
// }
```

## Response DTO

All service methods return normalized `VideoDTO` objects:

```typescript
interface VideoDTO {
  videoId: string; // YouTube video ID
  url: string; // Full YouTube URL
  title: string; // Original title
  obfuscatedTitle: string; // Masked title
  publishedAt: string; // ISO 8601 timestamp
  viewCount: number; // Total views
  likeCount: number; // Total likes
  heatScore: number; // Computed metric for visualization
}
```

## Heat Score Calculation

The heat score is computed using:

- 70% weight on normalized view count (log scale)
- 30% weight on normalized like count (log scale)

This provides a balanced metric for bubble sizing in visualizations.

## Error Handling

The service throws actionable errors for common scenarios:

```typescript
try {
  const videos = await service.fetchVideosInDateRange(options);
} catch (error) {
  if (error.message.includes('quota exceeded')) {
    // Handle quota limit
    console.error('API quota exceeded:', error.message);
  } else if (error.message.includes('Network failure')) {
    // Handle network issues
    console.error('Network error:', error.message);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error.message);
  }
}
```

## Caching Behavior

- Requests with identical parameters within the TTL window return cached results
- Cache keys are generated from method and parameters
- Cache hits are logged to console for verification
- Cache automatically evicts least recently used entries when full

## Development

```bash
# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## License

MIT
