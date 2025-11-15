const { obfuscateTitle, resolveConfig, STRENGTH_PRESETS } = require('./utils/titleObfuscator');
const youtubeService = require('./services/youtubeService');

module.exports = {
  obfuscateTitle,
  resolveConfig,
  STRENGTH_PRESETS,
  youtubeService,
};
