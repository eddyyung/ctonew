const nlp = require('compromise');

const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'of',
  'and',
  'or',
  'for',
  'to',
  'in',
  'on',
  'at',
  'by',
  'with',
  'from',
  'into',
  'over',
  'under',
  'after',
  'before',
  'de',
  'la',
  'el',
  'los',
  'las',
  'del',
  'y',
  'en',
  'para',
  'con',
  'por',
]);

const STRENGTH_PRESETS = {
  trending: {
    targetMaskRatio: 0.6,
    keyNounCount: 1,
    maskStyle: 'initial',
    maskCharacter: '*',
    minWordLength: 3,
  },
  search: {
    targetMaskRatio: 0.4,
    keyNounCount: 2,
    maskStyle: 'balanced',
    maskCharacter: '*',
    minWordLength: 3,
  },
};

function resolveConfig(options = {}) {
  const strength = options.strength || 'trending';
  const preset = STRENGTH_PRESETS[strength] || STRENGTH_PRESETS.trending;
  return {
    ...preset,
    ...options,
    strength,
  };
}

function tokenizeTitle(title) {
  const doc = nlp(title || '');
  const json = doc.json();
  const tokens = [];

  json.forEach((sentence) => {
    (sentence.terms || []).forEach((term) => {
      tokens.push({
        index: tokens.length,
        text: term.text || '',
        normal: term.normal || (term.text || '').toLowerCase(),
        pre: term.pre || '',
        post: term.post || '',
        tags: new Set(term.tags || []),
      });
    });
  });

  return tokens.map((token) => ({
    ...token,
    isWord: /[\p{L}\p{N}]/u.test(token.text),
    lower: (token.normal || token.text || '').toLowerCase(),
  }));
}

function isStopWord(token) {
  return STOPWORDS.has(token.lower);
}

function scoreToken(token, totalCount) {
  let score = 0;
  if (token.tags.has('ProperNoun') || token.tags.has('Person') || token.tags.has('Organization')) {
    score += 5;
  }
  if (token.tags.has('Noun')) {
    score += 3;
  }
  if (token.tags.has('Acronym')) {
    score += 3;
  }
  if (token.tags.has('Verb')) {
    score += 2;
  }
  if (token.tags.has('Adjective')) {
    score += 1.5;
  }
  if (/^[A-ZÁÉÍÓÚÜÑÄÖÅÆØÇ]/.test(token.text)) {
    score += 1;
  }
  score += Math.min(token.text.length / 2, 3);
  const positionBias = totalCount > 1 ? (token.index / (totalCount - 1)) : 0;
  score += positionBias * 2;

  return score;
}

function selectKeyWordIndices(tokens, config) {
  const candidates = tokens
    .filter((token) => token.isWord && !isStopWord(token));

  const scored = candidates
    .map((token) => ({ token, score: scoreToken(token, tokens.length) }))
    .sort((a, b) => b.score - a.score);

  const selected = new Set();

  for (const { token } of scored) {
    selected.add(token.index);
    if (selected.size >= config.keyNounCount) {
      break;
    }
  }

  return selected;
}

function shouldMaskToken(token, keyWordIndices, config) {
  if (!token.isWord) {
    return false;
  }
  if (keyWordIndices.has(token.index)) {
    return false;
  }
  if (isStopWord(token)) {
    return false;
  }
  if (token.text.length < config.minWordLength) {
    return false;
  }
  if (/^\d+[a-zA-Z]*$/.test(token.text)) {
    return false;
  }

  if (token.tags.has('Acronym')) {
    return false;
  }
  if (token.tags.has('Preposition') || token.tags.has('Determiner') || token.tags.has('Conjunction')) {
    return false;
  }

  const maskTags = ['Noun', 'Adjective', 'Verb', 'Adverb'];
  return maskTags.some((tag) => token.tags.has(tag));
}

function maskWord(word, config) {
  const maskChar = config.maskCharacter || '*';
  const characters = Array.from(word);

  if (characters.length === 0) {
    return word;
  }

  if (config.maskStyle === 'balanced') {
    if (characters.length <= 2) {
      return `${characters[0]}${maskChar.repeat(Math.max(characters.length - 1, 1))}`;
    }
    const middle = maskChar.repeat(characters.length - 2);
    return `${characters[0]}${middle}${characters[characters.length - 1]}`;
  }

  if (characters.length === 1) {
    return maskChar;
  }

  const rest = maskChar.repeat(characters.length - 1);
  return `${characters[0]}${rest}`;
}

function buildMaskedSet(maskCandidates, config) {
  if (!maskCandidates.length) {
    return new Set();
  }

  const maskCount = Math.max(1, Math.ceil(maskCandidates.length * config.targetMaskRatio));
  const masked = new Set();

  for (let i = 0; i < maskCandidates.length && masked.size < maskCount; i += 1) {
    masked.add(maskCandidates[i].index);
  }

  return masked;
}

function ensureMinimumMasking(maskedSet, tokens, keyWordIndices) {
  if (maskedSet.size > 0) {
    return maskedSet;
  }

  const fallback = tokens
    .filter((token) => token.isWord && !keyWordIndices.has(token.index))
    .sort((a, b) => b.text.length - a.text.length)[0];

  if (fallback) {
    maskedSet.add(fallback.index);
  }

  return maskedSet;
}

function obfuscateTitle(title, options = {}) {
  if (typeof title !== 'string') {
    return '';
  }

  const trimmed = title.trim();
  if (!trimmed) {
    return '';
  }

  const config = resolveConfig(options);
  const tokens = tokenizeTitle(trimmed);
  if (!tokens.length) {
    return trimmed;
  }

  const keyWordIndices = selectKeyWordIndices(tokens, config);
  const maskCandidates = tokens.filter((token) => shouldMaskToken(token, keyWordIndices, config));
  const maskedIndices = ensureMinimumMasking(buildMaskedSet(maskCandidates, config), tokens, keyWordIndices);

  const result = tokens
    .map((token) => {
      const text = maskedIndices.has(token.index) ? maskWord(token.text, config) : token.text;
      return `${token.pre || ''}${text}${token.post || ''}`;
    })
    .join('');

  return result.trim();
}

module.exports = {
  obfuscateTitle,
  resolveConfig,
  STRENGTH_PRESETS,
};
