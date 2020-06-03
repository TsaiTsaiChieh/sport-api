const modules = require('../../util/modules');
// const https = require('https');
// const db = require('../../util/dbUtil');
const firebaseAdmin = modules.firebaseAdmin;
// const firebase = modules.firebase;
// const firebaseConfig = modules.envValues.firebaseConfig;
// firebase.initializeApp(firebaseConfig);
// const jwt = require('jsonwebtoken');
const envValues = require('../../config/env_values');
const userUtils = require('../../util/userUtil');
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
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // const lineState = req.query.state;

  // https://api.line.me/oauth2/v2.1/token`
  const token_response = await lineLogin.issue_access_token(lineAccessToken);
  // let decoded_id_token;
  try {
    // decoded_id_token = jwt.verify(
    //   token_response.id_token,
    //   envValues.lineConfig.channelSecret,
    //   {
    //     audience: envValues.lineConfig.channelID,
    //     issuer: 'https://access.line.me',
    //     algorithms: ['HS256']
    //   }
    // );
    // console.log('id token verification succeeded.');
    // console.log('test state', JSON.stringify(token_response));
    // token_response.id_token = decoded_id_token;

    const verify_response = await lineLogin.verify_access_token(token_response.access_token);
    if (verify_response.client_id !== envValues.lineConfig.channelID) {
      return res.status(401).send({ error: 'Line channel ID mismatched' });
    }
    const userRecord = await userUtils.getFirebaseUser(token_response);
    const token = await firebaseAdmin.auth().createCustomToken(userRecord.uid);
    // const customT
    // const sessionCookie = await firebaseAdmin.auth().createSessionCookie(token, { expiresIn: envValues.cookieOptions.maxAge });
    // const period = modules.getTitlesPeriod(new Date()).period;
    // const mysqlUser = await db.sequelize.query(
    //   `
    //           SELECT *
    //             FROM users
    //            WHERE uid = '${userRecord.uid}'
    //          `,
    //   {
    //     plain: true,
    //     type: db.sequelize.QueryTypes.SELECT
    //   });
    //
    // const titlesQuery = await db.sequelize.query(
    //   `
    //             SELECT ml.name, ml.sport_id, t.rank_id
    //               FROM titles t, match__leagues ml
    //              WHERE t.league_id = ml.league_id
    //                AND uid = '${userRecord.uid}'
    //                AND period = '${period}'
    //            `,
    //   {
    //     type: db.sequelize.QueryTypes.SELECT
    //   });
    //
    // const titles = {};
    // titlesQuery.forEach(function(data) { // 這裡有順序性
    //   titles[data.name] = repackage(data);
    //   mysqlUser.titles = titles;
    // });
    // returnJson.token = sessionCookie;
    // returnJson.success = true;
    // returnJson.status = 0;
    //
    // if (mysqlUser) {
    //   console.log('firestoreUser exist');
    //   if (mysqlUser) {
    //     returnJson.uid = mysqlUser.uid;
    //   } else {
    //     res.status(401).json({ success: false });
    //   }
    //   if (mysqlUser.status) {
    //     returnJson.status = mysqlUser.status;
    //     returnJson.data = mysqlUser;
    //   }
    // } else {
    //   returnJson.status = 0;
    // }
    // returnJson.data = mysqlUser;
    // res.cookie('__session', token, envValues.cookieOptions);
    // res.status(200).json(returnJson);
    // 以上create sessioncookie
    // res.status(200).json({ token: token });
    // const expiresIn = 100000;
    // // // const options = {maxAge: expiresIn, httpOnly: true, secure: true};
    // // // const options = {maxAge: expiresIn, secure: true};
    // const options = {
    //   maxAge: 60000,
    //   sameSite: 'None'
    // };
    // // // // res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    // res.cookie('auth_token', token, options);
    // return res.redirect(307, envValues.apiURL + 'line_login.html');
    // return res.header('Auth', token).redirect(307, envValues.productURL + 'lineLogin?token='+{token});
    return res.redirect(307, `${envValues.productURL}lineLogin?token=${token}`);
    // // res.redirect(307, 'https://doinfo.cc/line_login.html');
    // res.redirect(307, 'https://getsport.cc/line_login.html');
    // res.redirect(307, `http://appServer:5001/?key=value#token=${token}`);
    // lineSSR(sessionCookie);
    // request.post({
    //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
    //   url: 'http://localhost/test2.php',
    //   body: 'mes=heydude'
    // }, function(error, response, body) {
    //   console.log(body);
    // });
    // request({
    //   url: 'https://getsports.cc/lineLogin',
    //   method: 'POST',
    //   json: { token: token }
    // });
    // return;
  } catch (err) {
    console.error(
      'Error in authentication/lineHandler function by Rex',
      err
    );
    // console.log('id token verification failed.');
    // res.status(401).send({ error: 'login failed!' });
    res.redirect(401, envValues.productURL);
  }
}
// function repackage(ele) {
//   const data = {};
//   data.league = ele.name;
//   data.sport = ele.sport_id.toString();
//   data.rank = ele.rank_id.toString();
//
//   return data;
// }

// function lineSSR(RequestOptions) {
//   // const { data, ...options } = RequestOptions;
//   const url = 'https://api.twitter.com/oauth/request_token';
//   return new Promise((resolve, reject) => {
//     const req = https.request(options,
//       function(response) {
//         const { statusCode } = response;
//         if (statusCode >= 300) {
//           reject(
//             new Error(response.statusMessage)
//           );
//         }
//
//         const chunks = [];
//
//         response.on('data', (chunk) => {
//           chunks.push(chunk);
//         });
//
//         response.on('end', () => {
//           const result = Buffer.concat(chunks).toString();
//           resolve(JSON.parse(result));
//         });
//       });
//     req.write(JSON.stringify(data));
//     req.end();
//   });
// }
module.exports = loginHandler;
