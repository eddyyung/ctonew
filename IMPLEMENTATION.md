# YouTube Data Service Implementation

## Overview

This implementation provides a complete server-side module for interacting with the YouTube Data API v3, meeting all the requirements specified in the ticket.

## Features Implemented

### ✅ Core API Integration

- **YouTubeDataService class** encapsulates all YouTube Data API v3 interactions
- Uses `googleapis` npm package for official Google API support
- Implements typed responses with TypeScript interfaces

### ✅ Video Fetching with Date Range

- `fetchVideosInDateRange()` method implements:
  - `search.list` API call with `publishedAfter` and `publishedBefore` filters
  - Results sorted by view count
  - Hydration with `videos.list` to obtain view counts and like counts
  - Returns normalized VideoDTO objects

### ✅ Keyword Search

- `searchVideosByKeyword()` method implements:
  - Top 10 matches (configurable via `maxResults`)
  - Relevance-based sorting
  - Full metadata including views, likes, and computed heat score

### ✅ Title Obfuscation

- Configurable obfuscation levels: `low`, `medium`, `high`
- Replaces common nouns (video, tutorial, guide, etc.) with `[***]`
- Replaces common adjectives (best, top, amazing, etc.) with `[*]`
- Preserves key terms while masking generic words
- Applied per request via `obfuscationLevel` parameter

### ✅ LRU Caching

- Integrated `lru-cache` package (v10.0.0)
- Configurable max entries and TTL
- Cache keys generated from method name + parameters
- Cache hits logged to console for verification
- Provides `getCacheStats()` and `clearCache()` methods
- Automatic eviction of least recently used entries

### ✅ Rate Limiting

- Uses `p-limit` package for request throttling
- Configurable max concurrent requests (default: 5)
- Quota tracking with daily reset (configurable limit, default: 10000)
- Throws friendly error messages when quota exceeded
- Provides `getQuotaUsage()` method for monitoring

### ✅ Normalized DTO Response

All methods return `VideoDTO` objects with:

```typescript
interface VideoDTO {
  videoId: string; // YouTube video ID
  url: string; // Full YouTube URL
  title: string; // Original title
  obfuscatedTitle: string; // Masked title
  publishedAt: string; // ISO 8601 timestamp
  viewCount: number; // Total views
  likeCount: number; // Total likes
  heatScore: number; // Computed metric
}
```

### ✅ Heat Score Calculation

- Formula: `(log10(views + 1) * 0.7) + (log10(likes + 1) * 0.3)`
- 70% weight on view count (normalized with log scale)
- 30% weight on like count (normalized with log scale)
- Provides balanced metric suitable for bubble visualization sizing

### ✅ Error Handling

- Quota exceeded errors include current usage and reset time
- Network failures propagate with actionable messages
- API errors wrapped with context
- All errors include descriptive messages for debugging

## API Usage

### Initialization

```typescript
import { YouTubeDataService } from './services/youtube';

const service = new YouTubeDataService({
  apiKey: process.env.YOUTUBE_API_KEY,
  cacheOptions: {
    max: 100,
    ttl: 900000, // 15 minutes
  },
  rateLimitOptions: {
    maxConcurrent: 5,
    quotaLimit: 10000,
  },
});
```

### Fetch Videos in Date Range

```typescript
const videos = await service.fetchVideosInDateRange({
  publishedAfter: '2024-01-01T00:00:00Z',
  publishedBefore: '2024-01-31T23:59:59Z',
  maxResults: 50,
  obfuscationLevel: 'medium',
});
```

### Search by Keyword

```typescript
const results = await service.searchVideosByKeyword({
  query: 'javascript tutorial',
  maxResults: 10,
  obfuscationLevel: 'low',
});
```

### Monitor Cache and Quota

```typescript
const cacheStats = service.getCacheStats();
const quotaUsage = service.getQuotaUsage();
```

## Testing Acceptance Criteria

### ✅ Normalized Response Format

All service functions return `VideoDTO` objects with:

- ✅ `title` (original)
- ✅ `obfuscatedTitle` (masked)
- ✅ `videoId`
- ✅ `url`
- ✅ `publishedAt`
- ✅ `viewCount`
- ✅ `likeCount`
- ✅ `heatScore` (derived metric)

### ✅ Cache Reuse

- Cache keys include method name and all parameters
- Repeated requests within TTL return cached data
- Cache hits logged to console: `Cache hit for key: {key}`
- Cache misses log: `Cache set for key: {key}`

### ✅ Error Handling

- Quota exceeded: `"API quota exceeded. Current usage: X/Y. Resets at {timestamp}"`
- Network failure: `"Failed to {operation}: Network failure or API error occurred"`
- API errors: Contextual messages with operation details

## File Structure

```
src/
├── services/
│   └── youtube.ts          # Main service implementation
├── types/
│   └── index.ts           # TypeScript type definitions
├── examples/
│   └── usage.ts           # Usage examples
├── tests/
│   └── youtube.test.ts    # Test suite
└── index.ts               # Public API exports
```

## Dependencies

- `googleapis` (^128.0.0) - Official Google APIs client
- `lru-cache` (^10.0.0) - LRU cache implementation
- `p-limit` (^5.0.0) - Promise concurrency limiter

## Build & Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test            # Run tests (requires jest setup)
```

## Quota Management

The YouTube Data API v3 has quota costs:

- `search.list`: 100 units
- `videos.list`: 1 unit

This implementation:

- Tracks quota usage per instance
- Resets quota counter every 24 hours
- Throws error when quota exceeded
- Caching significantly reduces quota consumption

## Notes

- Cache TTL defaults to 15 minutes (900,000ms)
- Default max cache entries: 100
- Default concurrent request limit: 5
- Default daily quota: 10,000 units
- All timestamps use ISO 8601 format
- Heat scores are positive floating-point numbers
