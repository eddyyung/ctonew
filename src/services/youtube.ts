import { google, youtube_v3 } from 'googleapis';
import { LRUCache } from 'lru-cache';
import pLimit from 'p-limit';

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

interface CacheEntry {
  data: VideoDTO[];
  timestamp: number;
}

export class YouTubeDataService {
  private youtube: youtube_v3.Youtube;
  private cache: LRUCache<string, CacheEntry>;
  private rateLimiter: ReturnType<typeof pLimit>;
  private requestCount: number = 0;
  private quotaLimit: number;
  private resetTime: number = Date.now() + 24 * 60 * 60 * 1000;

  constructor(config: YouTubeServiceConfig) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: config.apiKey,
    });

    this.cache = new LRUCache<string, CacheEntry>({
      max: config.cacheOptions?.max ?? 100,
      ttl: config.cacheOptions?.ttl ?? 1000 * 60 * 15,
    });

    this.rateLimiter = pLimit(config.rateLimitOptions?.maxConcurrent ?? 5);
    this.quotaLimit = config.rateLimitOptions?.quotaLimit ?? 10000;
  }

  private checkQuota(cost: number = 1): void {
    if (Date.now() > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = Date.now() + 24 * 60 * 60 * 1000;
    }

    if (this.requestCount + cost > this.quotaLimit) {
      throw new Error(
        `API quota exceeded. Current usage: ${this.requestCount}/${this.quotaLimit}. Resets at ${new Date(this.resetTime).toISOString()}`
      );
    }

    this.requestCount += cost;
  }

  private getCacheKey(prefix: string, params: Record<string, any>): string {
    return `${prefix}:${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): VideoDTO[] | null {
    const entry = this.cache.get(key);
    if (entry) {
      console.log(`Cache hit for key: ${key}`);
      return entry.data;
    }
    return null;
  }

  private setCache(key: string, data: VideoDTO[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    console.log(`Cache set for key: ${key}`);
  }

  private calculateHeatScore(viewCount: number, likeCount: number): number {
    const viewWeight = 0.7;
    const likeWeight = 0.3;
    const normalizedViews = Math.log10(viewCount + 1);
    const normalizedLikes = Math.log10(likeCount + 1);
    return normalizedViews * viewWeight + normalizedLikes * likeWeight;
  }

  private obfuscateTitle(title: string, level: 'low' | 'medium' | 'high' = 'medium'): string {
    const commonNouns = [
      'video',
      'tutorial',
      'guide',
      'review',
      'update',
      'news',
      'show',
      'episode',
      'part',
      'series',
    ];
    const commonAdjectives = [
      'new',
      'best',
      'top',
      'amazing',
      'incredible',
      'awesome',
      'great',
      'ultimate',
      'perfect',
      'complete',
    ];

    let result = title;

    const replacementCount = level === 'low' ? 1 : level === 'medium' ? 2 : 3;

    for (let i = 0; i < replacementCount; i++) {
      for (const noun of commonNouns) {
        const regex = new RegExp(`\\b${noun}\\b`, 'gi');
        if (result.match(regex)) {
          result = result.replace(regex, '[***]');
          break;
        }
      }
    }

    for (let i = 0; i < replacementCount; i++) {
      for (const adj of commonAdjectives) {
        const regex = new RegExp(`\\b${adj}\\b`, 'gi');
        if (result.match(regex)) {
          result = result.replace(regex, '[*]');
          break;
        }
      }
    }

    return result;
  }

  private async hydrateVideos(videoIds: string[]): Promise<VideoDTO[]> {
    if (videoIds.length === 0) {
      return [];
    }

    try {
      this.checkQuota(1);

      const response = await this.rateLimiter(() =>
        this.youtube.videos.list({
          part: ['snippet', 'statistics'],
          id: videoIds,
        })
      );

      if (!response.data.items) {
        return [];
      }

      return response.data.items
        .filter((item) => item.id && item.snippet && item.statistics)
        .map((item) => {
          const viewCount = parseInt(item.statistics!.viewCount || '0', 10);
          const likeCount = parseInt(item.statistics!.likeCount || '0', 10);
          const title = item.snippet!.title || 'Untitled';

          return {
            videoId: item.id!,
            url: `https://www.youtube.com/watch?v=${item.id}`,
            title,
            obfuscatedTitle: title,
            publishedAt: item.snippet!.publishedAt || '',
            viewCount,
            likeCount,
            heatScore: this.calculateHeatScore(viewCount, likeCount),
          };
        });
    } catch (error: any) {
      if (error.message?.includes('quota')) {
        throw error;
      }
      throw new Error(`Failed to hydrate videos: ${error.message || 'Unknown error occurred'}`);
    }
  }

  public async fetchVideosInDateRange(options: DateRangeOptions): Promise<VideoDTO[]> {
    const cacheKey = this.getCacheKey('dateRange', options);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      this.checkQuota(100);

      const searchResponse = await this.rateLimiter(() =>
        this.youtube.search.list({
          part: ['snippet'],
          type: ['video'],
          order: 'viewCount',
          publishedAfter: options.publishedAfter,
          publishedBefore: options.publishedBefore,
          maxResults: options.maxResults ?? 50,
        })
      );

      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        return [];
      }

      const videoIds = searchResponse.data.items
        .filter((item) => item.id?.videoId)
        .map((item) => item.id!.videoId!);

      const videos = await this.hydrateVideos(videoIds);

      const videosWithObfuscation = videos.map((video) => ({
        ...video,
        obfuscatedTitle: this.obfuscateTitle(video.title, options.obfuscationLevel || 'medium'),
      }));

      this.setCache(cacheKey, videosWithObfuscation);
      return videosWithObfuscation;
    } catch (error: any) {
      if (error.message?.includes('quota')) {
        throw error;
      }
      throw new Error(
        `Failed to fetch videos in date range: ${error.message || 'Network failure or API error occurred'}`
      );
    }
  }

  public async searchVideosByKeyword(options: KeywordSearchOptions): Promise<VideoDTO[]> {
    const cacheKey = this.getCacheKey('keyword', options);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      this.checkQuota(100);

      const searchResponse = await this.rateLimiter(() =>
        this.youtube.search.list({
          part: ['snippet'],
          q: options.query,
          type: ['video'],
          order: 'relevance',
          maxResults: options.maxResults ?? 10,
        })
      );

      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        return [];
      }

      const videoIds = searchResponse.data.items
        .filter((item) => item.id?.videoId)
        .map((item) => item.id!.videoId!);

      const videos = await this.hydrateVideos(videoIds);

      const videosWithObfuscation = videos.map((video) => ({
        ...video,
        obfuscatedTitle: this.obfuscateTitle(video.title, options.obfuscationLevel || 'medium'),
      }));

      this.setCache(cacheKey, videosWithObfuscation);
      return videosWithObfuscation;
    } catch (error: any) {
      if (error.message?.includes('quota')) {
        throw error;
      }
      throw new Error(
        `Failed to search videos by keyword: ${error.message || 'Network failure or API error occurred'}`
      );
    }
  }

  public clearCache(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  public getCacheStats() {
    return {
      size: this.cache.size,
      max: this.cache.max,
    };
  }

  public getQuotaUsage() {
    return {
      used: this.requestCount,
      limit: this.quotaLimit,
      resetTime: new Date(this.resetTime).toISOString(),
    };
  }
}
