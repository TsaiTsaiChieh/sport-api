const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;

/**
 * @api {get} /auth/login create session cookie
 * @apiVersion 1.0.0
 * @apiName login
 * @apiGroup Auth
 * @apiPermission login user
 *
 * @apiParam (Request body) {token} token token generate from firebase SDK
 *
 * @apiSuccess {Boolean} success cookie create success
 * @apiSuccess {cookie} __session session cookie
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": "true"
 *     }
 *
 * @apiError TokenMissing session cookie not exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Token Missing
 *     {
 *       "success": "false"
 *     }
 */
async function firebaseLogin(req, res) {
    let returnJson = {success: false};
    let token = req.body.token;
    // let uid = req.body.uid;
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!token) {
        console.log('Error login user: missing token');
        return res.status(401).json(returnJson);
    }
    firebaseAdmin.auth().verifyIdToken(token)
    // eslint-disable-next-line promise/always-return
        .then((decodedIdToken) => {
            // Create session cookie and set it.
            let expiresIn = 60 * 60 * 24 * 7 * 1000;
            firebaseAdmin.auth().createSessionCookie(token, {expiresIn})
                .then(async (sessionCookie) => {
                    let firestoreUser = await userUtils.getUserProfile(decodedIdToken.uid);
                    returnJson.success = true;
                    if (firestoreUser) {
                        console.log("firestoreUser exist");
                        returnJson.uid = firestoreUser.uid;
                        returnJson.userStats = firestoreUser.userStats;
                        returnJson.userInfo = firestoreUser.data;
                    }
                    let options = {maxAge: expiresIn, httpOnly: true};
                    // let options = {maxAge: expiresIn, httpOnly: true, secure: true};
                    res.cookie('__session', sessionCookie, options);
                    return res.status(200).json(returnJson)
                })
                .catch((error) => {
                    console.log('Error login user: \n\t', error);
                    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                    return res.status(401).json({success: false})
                });
        }).catch((error) => {
        console.log('Error login user: \n\t', error);
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(401).json({success: false})
    });
}

module.exports = firebaseLogin;