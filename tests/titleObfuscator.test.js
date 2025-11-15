const { obfuscateTitle, resolveConfig, STRENGTH_PRESETS } = require('../src/utils/titleObfuscator');

describe('title obfuscation utility', () => {
  it('masks descriptive words while preserving key nouns for trending strength', () => {
    const original = 'Amazing New Smartphone Review';
    const obfuscated = obfuscateTitle(original, { strength: 'trending' });

    expect(obfuscated).not.toEqual(original);
    expect(obfuscated).toContain('Smartphone');
    expect(obfuscated).not.toContain('Amazing');

    const maskedWords = (obfuscated.match(/\*/g) || []).length;
    expect(maskedWords).toBeGreaterThanOrEqual(3);
  });

  it('applies a lighter mask for search strength', () => {
    const original = 'Amazing New Smartphone Review';
    const trending = obfuscateTitle(original, { strength: 'trending' });
    const search = obfuscateTitle(original, { strength: 'search' });

    const trendingMaskCount = (trending.match(/\*/g) || []).length;
    const searchMaskCount = (search.match(/\*/g) || []).length;

    expect(trendingMaskCount).toBeGreaterThan(searchMaskCount);
    expect(search).toContain('Review');
    expect(search).not.toEqual(original);
  });

  it('ensures deterministic output for identical inputs', () => {
    const sample = '2024 Update: AI in Healthcare & Finance';
    const first = obfuscateTitle(sample, { strength: 'trending' });
    const second = obfuscateTitle(sample, { strength: 'trending' });

    expect(first).toEqual(second);
  });

  it('supports multilingual titles while preserving core meaning', () => {
    const title = 'Increíble análisis del teléfono plegable';
    const obfuscated = obfuscateTitle(title, { strength: 'trending' });

    expect(obfuscated).toContain('teléfono');
    expect(obfuscated).not.toContain('Increíble');
  });

  it('allows overriding configuration such as mask character', () => {
    const title = 'Breaking News: Massive Storm Approaches';
    const obfuscated = obfuscateTitle(title, { maskCharacter: '#', strength: 'trending' });

    expect(obfuscated).toContain('#');
    expect(obfuscated).not.toContain('Breaking');
  });

  it('exposes presets for strengths', () => {
    const config = resolveConfig({ strength: 'search' });

    expect(config.targetMaskRatio).toBe(STRENGTH_PRESETS.search.targetMaskRatio);
    expect(config.strength).toBe('search');
  });
});
