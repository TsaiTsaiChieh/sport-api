const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;
const jwt = require('jsonwebtoken');
const envValues = require('../../config/env_values');
const userUtils = require('../../util/userUtil');
const line_login = require('line-login');
const lineLogin = new line_login({
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
function loginHandler(req, res) {
  const lineAccessToken = req.query.code;
  if (!lineAccessToken) {
    res.status(401).send({ error: 'login failed!' });
    return;
  }
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // const lineState = req.query.state;

  // https://api.line.me/oauth2/v2.1/token`
  lineLogin.issue_access_token(lineAccessToken).then(token_response => {
    let decoded_id_token;
    try {
      decoded_id_token = jwt.verify(
        token_response.id_token,
        envValues.lineConfig.channelSecret,
        {
          audience: envValues.lineConfig.channelID,
          issuer: 'https://access.line.me',
          algorithms: ['HS256']
        }
      );
      console.log('id token verification succeeded.');
      console.log('test state', JSON.stringify(token_response));
      token_response.id_token = decoded_id_token;

      // if (!secure_compare(decoded_id_token.nonce, req.session.line_login_nonce)) {
      //     res.status(500).send({error: 'login failed! nonce error'});
      // }

      lineLogin
        .verify_access_token(token_response.access_token)
        .then(verify_response => {
          if (verify_response.client_id !== envValues.lineConfig.channelID) {
            Promise.reject(new Error('Line channel ID mismatched'));
            return;
          }
          userUtils
            .getFirebaseUser(token_response)
            .then(userRecord => {
              firebaseAdmin
                .auth()
                .createCustomToken(userRecord.uid)
                .then(token => {
                  const expiresIn = 3 * 60 * 1000;
                  // const options = {maxAge: expiresIn, httpOnly: true, secure: true};
                  // const options = {maxAge: expiresIn, secure: true};
                  const options = {
                    maxAge: expiresIn,
                    domain: envValues.domain
                  };
                  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
                  res.cookie('auth_token', token, options);
                  // return res.redirect(307, envValues.indexURL + 'line_login.html');
                  res.redirect(307, 'https://doinfo.cc/line_login.html');
                });
            })
            .catch(function(err) {
              console.log('id token verification failed.', err);
              res.status(500).send({ error: 'login failed!' });
            });
        });
    } catch (exception) {
      console.log('id token verification failed.');
      res.status(401).send({ error: 'login failed!' });
    }
  });
}

module.exports = loginHandler;
