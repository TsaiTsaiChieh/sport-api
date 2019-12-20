const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;
const jwt = require("jsonwebtoken");
const envValues = require('../../config/env_values');
const userUtils = require('../../util/userUtil');
const line_login = require("line-login");
const lineLogin = new line_login({
    channel_id: envValues.lineConfig.channelID,
    channel_secret: envValues.lineConfig.channelSecret,
    callback_url: envValues.lineConfig.callbackURL,
    scope: "openid profile email",
    prompt: "consent",
    bot_prompt: "normal"
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
// function loginHandler(req, res) {
//     const lineAccessToken = req.query.code;
//     if (!lineAccessToken) return res.status(401).send({error: 'login failed!'});
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     // const lineState = req.query.state;
//
//     // https://api.line.me/oauth2/v2.1/token`
//     lineLogin.issue_access_token(lineAccessToken).then((token_response) => {
//         let decoded_id_token;
//         try {
//             decoded_id_token = jwt.verify(
//                 token_response.id_token,
//                 envValues.lineConfig.channelSecret,
//                 {
//                     audience: envValues.lineConfig.channelID,
//                     issuer: "https://access.line.me",
//                     algorithms: ["HS256"]
//                 }
//             );
//             console.log("id token verification succeeded.");
//             console.log("test state", JSON.stringify(token_response));
//             token_response.id_token = decoded_id_token;
//
//             // if (!secure_compare(decoded_id_token.nonce, req.session.line_login_nonce)) {
//             //     res.status(500).send({error: 'login failed! nonce error'});
//             // }
//
//             lineLogin.verify_access_token(token_response.access_token).then((verify_response) => {
//                 if (verify_response.client_id !== envValues.lineConfig.channelID) {
//                     return Promise.reject(new Error('Line channel ID mismatched'));
//                 }
//                 userUtils.getFirebaseUser(token_response).then(userRecord => {
//                     firebaseAdmin.auth().createCustomToken(userRecord.uid).then(token => {
//                         const expiresIn = 3 * 60 * 1000;
//                         // const options = {maxAge: expiresIn, httpOnly: true, secure: true};
//                         // const options = {maxAge: expiresIn, secure: true};
//                         const options = {maxAge: expiresIn, domain: envValues.domain};
//                         res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
//                         res.cookie('auth_token', token, options);
//                         // return res.redirect(307, envValues.indexURL + 'line_login.html');
//                         return res.redirect(307, 'https://chat.doinfo.cc/statics/line_login.html');
//                     })
//                 }).catch(function (err) {
//                     console.log("id token verification failed.", err);
//                     res.status(500).send({error: 'login failed!'});
//                 })
//             })
//         } catch (exception) {
//             console.log("id token verification failed.");
//             return res.status(401).send({error: 'login failed!'});
//         }
//     });
// }
async function loginHandler(req, res) {
    const lineAccessToken = req.query.code;
    if (!lineAccessToken) return res.status(401).send({error: 'login failed!'});
    res.setHeader('Access-Control-Allow-Origin', '*');
    // const lineState = req.query.state;

    // https://api.line.me/oauth2/v2.1/token`

    try {
        const token_response = await lineLogin.issue_access_token(lineAccessToken);
        let decoded_id_token;
        decoded_id_token = jwt.verify(
            token_response.id_token,
            envValues.lineConfig.channelSecret,
            {
                audience: envValues.lineConfig.channelID,
                issuer: "https://access.line.me",
                algorithms: ["HS256"]
            }
        );
        console.log("id token verification succeeded.");
        console.log("test state", JSON.stringify(token_response));
        token_response.id_token = decoded_id_token;

        // if (!secure_compare(decoded_id_token.nonce, req.session.line_login_nonce)) {
        //     res.status(500).send({error: 'login failed! nonce error'});
        // }

        // eslint-disable-next-line promise/catch-or-return
        const verify_response = await lineLogin.verify_access_token(token_response.access_token);
        console.log("1..", verify_response);
        if (verify_response.client_id !== envValues.lineConfig.channelID) {
            return Promise.reject(new Error('Line channel ID mismatched'));
        }
        let returnJson = {success: false};
        const expiresIn = 60 * 60 * 24 * 7 * 1000;
        const userRecord = await userUtils.getFirebaseUser(token_response);
        console.log("2..", userRecord);
        const token = await firebaseAdmin.auth().createCustomToken(userRecord.uid);
        // const token = await userRecord.getIdToken();
        console.log("3..", token);
        return res.json({token: token});
        // const decodedIdToken = await firebaseAdmin.auth().verifyIdToken(token);
        // const sessionCookie = await firebaseAdmin.auth().createSessionCookie(token, {expiresIn});
        // console.log("4..", sessionCookie);
        // const firestoreUser = await userUtils.getUserProfile(userRecord.uid);
        // console.log("5..", firestoreUser);
        // returnJson.success = true;
        // if (firestoreUser.uid) {
        //     returnJson.uid = firestoreUser.uid;
        // } else {
        //     return res.status(401).json({success: false})
        // }
        // if (firestoreUser.status) {
        //     returnJson.status = firestoreUser.status;
        // } else {
        //     returnJson.status = 0;
        // }
        // returnJson.data = firestoreUser.data;
        // // let options = {maxAge: expiresIn, httpOnly: true};
        // // es.cookie('name', 'tobi', { domain: '.example.com', path: '/admin', secure: true })
        // // res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        // // let options = {maxAge: expiresIn, httpOnly: true, domain: envValues.domain};
        // let options = {maxAge: expiresIn};
        // res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        // res.cookie('__session', sessionCookie, options);
        // return res.status(200).json(returnJson)
    } catch (exception) {
        console.log("id token verification failed.", exception);
        return res.status(401).send({error: 'login failed!'});
    }
}


module.exports = loginHandler;
