const Line_login = require('line-login');
const envValues = require('../../config/env_values');
const lineLogin = new Line_login({
  channel_id: envValues.lineConfig.channelID,
  channel_secret: envValues.lineConfig.channelSecret,
  callback_url: envValues.lineConfig.callbackURL,
  scope: 'openid profile email',
  prompt: 'consent',
  bot_prompt: 'normal'
});

module.exports = lineLogin.auth();
