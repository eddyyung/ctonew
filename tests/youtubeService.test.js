const { formatVideoResponse, formatVideoCollection } = require('../src/services/youtubeService');

const countMaskCharacters = (value) => (value.match(/\*/g) || []).length;

describe('YouTube service integration', () => {
  it('provides both original and obfuscated titles with trending defaults', () => {
    const video = { id: 'abc123', title: 'Amazing New Smartphone Review' };

    const result = formatVideoResponse(video);

    expect(result.id).toBe(video.id);
    expect(result.titleOriginal).toBe(video.title);
    expect(result.titleObfuscated).not.toBe(video.title);
    expect(result.title).toBe(result.titleObfuscated);
    expect(result.obfuscation.strength).toBe('trending');
  });

  it('supports configurable obfuscation strength', () => {
    const video = { id: 'xyz789', title: '2024 Update: AI in Healthcare & Finance' };

    const trending = formatVideoResponse(video, { obfuscation: 'trending' });
    const search = formatVideoResponse(video, { obfuscation: 'search' });

    expect(trending.obfuscation.strength).toBe('trending');
    expect(search.obfuscation.strength).toBe('search');
    expect(countMaskCharacters(trending.titleObfuscated)).toBeGreaterThan(
      countMaskCharacters(search.titleObfuscated)
    );
  });

  it('maps collections and filters out non objects gracefully', () => {
    const collection = [
      { id: '1', title: 'Breaking News: Massive Storm Approaches' },
      null,
      { id: '2', title: 'Calm Weather Returns Tomorrow' },
    ];

    const formatted = formatVideoCollection(collection, { obfuscation: 'trending' });

    expect(formatted).toHaveLength(2);
    formatted.forEach((item) => {
      expect(item.titleOriginal).toBeDefined();
      expect(item.titleObfuscated).toBeDefined();
      expect(item.title).toBe(item.titleObfuscated);
    });
  });
});
