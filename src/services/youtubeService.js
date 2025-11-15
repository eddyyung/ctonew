const { obfuscateTitle, resolveConfig } = require('../utils/titleObfuscator');

function normaliseObfuscationOptions(obfuscation) {
  if (!obfuscation) {
    return {};
  }

  if (typeof obfuscation === 'string') {
    return { strength: obfuscation };
  }

  return obfuscation;
}

function formatVideoResponse(video, options = {}) {
  if (!video || typeof video !== 'object') {
    return null;
  }

  const obfuscationOptions = normaliseObfuscationOptions(options.obfuscation);
  const titleOriginal = video.title || '';
  const titleObfuscated = obfuscateTitle(titleOriginal, obfuscationOptions);

  return {
    ...video,
    title: titleObfuscated,
    titleOriginal,
    titleObfuscated,
    obfuscation: resolveConfig(obfuscationOptions),
  };
}

function formatVideoCollection(collection = [], options = {}) {
  return collection.map((video) => formatVideoResponse(video, options)).filter(Boolean);
}

module.exports = {
  formatVideoResponse,
  formatVideoCollection,
  normaliseObfuscationOptions,
};
