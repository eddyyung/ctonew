const requireApiKey = (req, res, next) => {
  const session = req.session || {};
  if (session.apiKey) {
    return next();
  }

  const message = session.apiKeyError || 'A valid API key is required to access this resource.';

  return res.status(401).json({
    error: 'unauthorized',
    message,
  });
};

module.exports = {
  requireApiKey,
};
