const { isApiKeyValid } = require('../utils/apiKey');

const extractApiKey = (req) => {
  if (!req || !req.headers) {
    return null;
  }

  const headerKey = req.headers['x-api-key'];
  if (typeof headerKey === 'string' && headerKey.trim().length > 0) {
    return headerKey.trim();
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string') {
    const [scheme, credential] = authHeader.split(' ');
    if (scheme && credential && scheme.toLowerCase() === 'bearer') {
      return credential.trim();
    }
  }

  if (req.query && req.query.apiKey) {
    return String(req.query.apiKey).trim();
  }

  if (req.body && req.body.apiKey) {
    return String(req.body.apiKey).trim();
  }

  return null;
};

const sessionMiddleware = (req, res, next) => {
  const apiKey = extractApiKey(req);
  req.session = req.session && typeof req.session === 'object' ? req.session : {};

  if (!apiKey) {
    return next();
  }

  if (isApiKeyValid(apiKey)) {
    req.session.apiKey = apiKey;
    delete req.session.apiKeyError;
    return next();
  }

  req.session.apiKeyError = 'Invalid API key provided.';
  delete req.session.apiKey;
  return next();
};

module.exports = {
  sessionMiddleware,
  extractApiKey,
};
