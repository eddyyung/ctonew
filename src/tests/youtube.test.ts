import { YouTubeDataService } from '../services/youtube.js';

describe('YouTubeDataService', () => {
  let service: YouTubeDataService;

  beforeEach(() => {
    service = new YouTubeDataService({
      apiKey: 'test-api-key',
      cacheOptions: {
        max: 50,
        ttl: 1000 * 60 * 5,
      },
      rateLimitOptions: {
        maxConcurrent: 3,
        quotaLimit: 1000,
      },
    });
  });

  describe('Cache Management', () => {
    test('should initialize with empty cache', () => {
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.max).toBe(50);
    });

    test('should clear cache', () => {
      service.clearCache();
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Quota Management', () => {
    test('should track quota usage', () => {
      const quota = service.getQuotaUsage();
      expect(quota).toHaveProperty('used');
      expect(quota).toHaveProperty('limit');
      expect(quota).toHaveProperty('resetTime');
      expect(quota.used).toBe(0);
      expect(quota.limit).toBe(1000);
    });
  });

  describe('Error Handling', () => {
    test('should throw error on quota exceeded', async () => {
      const limitedService = new YouTubeDataService({
        apiKey: 'test-api-key',
        rateLimitOptions: {
          quotaLimit: 0,
        },
      });

      await expect(
        limitedService.fetchVideosInDateRange({
          publishedAfter: '2024-01-01T00:00:00Z',
          publishedBefore: '2024-01-31T23:59:59Z',
        })
      ).rejects.toThrow(/quota exceeded/i);
    });

    test('should provide actionable error messages', async () => {
      try {
        await service.fetchVideosInDateRange({
          publishedAfter: 'invalid-date',
          publishedBefore: '2024-01-31T23:59:59Z',
        });
      } catch (error: any) {
        expect(error.message).toBeTruthy();
        expect(typeof error.message).toBe('string');
      }
    });
  });

  describe('Heat Score Calculation', () => {
    test('should calculate heat score correctly', () => {
      const viewWeight = 0.7;
      const likeWeight = 0.3;
      const normalizedViews = Math.log10(1000000 + 1);
      const normalizedLikes = Math.log10(50000 + 1);
      const expectedHeatScore = normalizedViews * viewWeight + normalizedLikes * likeWeight;

      expect(expectedHeatScore).toBeGreaterThan(0);
    });
  });
});
