const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;
const envValues = require('../../config/env_values');
const userUtils = require('../../util/userUtil');
const jwt = require('jsonwebtoken');
const Line_login = require('line-login');
const lineLogin = new Line_login({
  channel_id: envValues.lineConfig.channelID,
  channel_secret: envValues.lineConfig.channelSecret,
  callback_url: envValues.lineConfig.callbackURL,
  scope: 'openid profile email',
  prompt: 'consent',
  bot_prompt: 'normal'
});

/**
 * @api {get} /auth/lineLogin Line Authentication
 * @apiVersion 1.0.0
 * @apiName lineLogin
 * @apiGroup Auth
 * @apiPermission none
 *
 * @apiSuccess {cookie} token auth token from Line SDK
 *
 * @apiSuccessExample Success-Response:
 *     redirect callback URL(line_login.html) to signInWithCustomToken
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Auth Failed
 */

// call from Line SDK
async function loginHandler(req, res) {
  // const returnJson = { success: false };
  const lineAccessToken = req.query.code;
  if (!lineAccessToken) {
    return res.status(401).send({ error: 'login failed!' });
  }
  // https://api.line.me/oauth2/v2.1/token`
  try {
    const token_response = await lineLogin.issue_access_token(lineAccessToken);
    const decoded_id_token = jwt.verify(
      token_response.id_token,
      envValues.lineConfig.channelSecret,
      {
        audience: envValues.lineConfig.channelID,
        issuer: 'https://access.line.me',
        algorithms: ['HS256']
      });
    token_response.id_token = decoded_id_token;
    const verify_response = await lineLogin.verify_access_token(token_response.access_token);
    if (verify_response.client_id !== envValues.lineConfig.channelID) {
      return res.status(401).send({ error: 'Line channel ID mismatched' });
    }
    const userRecord = await userUtils.getFirebaseUser(token_response);
    const token = await firebaseAdmin.auth().createCustomToken(userRecord.uid);
    // res.json(token);
    return res.redirect(307, `${envValues.productURL}lineLogin?token=${token}`);
  } catch (err) {
    console.error('Error in authentication/lineHandler function by Rex', err);
    res.redirect(401, envValues.productURL);
  }
}
module.exports = loginHandler;
