const DEFAULT_VALID_KEYS = ['demo-key'];

const parseAllowedKeys = () => {
  const envKeys = process.env.ANALYTICS_API_KEYS;
  if (!envKeys) {
    return DEFAULT_VALID_KEYS;
  }

  return envKeys
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
};

let cachedKeys = null;

const getAllowedKeys = () => {
  if (!cachedKeys) {
    cachedKeys = parseAllowedKeys();
  }
  return cachedKeys;
};

const refreshAllowedKeys = () => {
  cachedKeys = parseAllowedKeys();
  return cachedKeys;
};

const MIN_API_KEY_LENGTH = 8;

const isApiKeyValid = (apiKey) => {
  if (typeof apiKey !== 'string') {
    return false;
  }
  const trimmed = apiKey.trim();
  if (trimmed.length < MIN_API_KEY_LENGTH) {
    return false;
  }

  const allowedKeys = getAllowedKeys();
  if (allowedKeys.length === 0) {
    return true;
  }

  return allowedKeys.includes(trimmed);
};

module.exports = {
  isApiKeyValid,
  refreshAllowedKeys,
};
