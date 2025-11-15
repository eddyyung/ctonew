export interface VideoDTO {
  videoId: string;
  url: string;
  title: string;
  obfuscatedTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  heatScore: number;
}

export interface DateRangeOptions {
  publishedAfter: string;
  publishedBefore: string;
  maxResults?: number;
  obfuscationLevel?: 'low' | 'medium' | 'high';
}

export interface KeywordSearchOptions {
  query: string;
  maxResults?: number;
  obfuscationLevel?: 'low' | 'medium' | 'high';
}

export interface YouTubeServiceConfig {
  apiKey: string;
  cacheOptions?: {
    max?: number;
    ttl?: number;
  };
  rateLimitOptions?: {
    maxConcurrent?: number;
    quotaLimit?: number;
  };
}

export interface CacheStats {
  size: number;
  max: number;
}

export interface QuotaUsage {
  used: number;
  limit: number;
  resetTime: string;
}
