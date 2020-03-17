const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;

/**
 * @api {get} /auth/verifySessionCookie Verify Session Cookie
 * @apiVersion 1.0.0
 * @apiName VerifySessionCookie
 * @apiGroup Auth
 * @apiPermission login user
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 *
 * @apiSuccess {Boolean} success verify result success
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
function verifySessionCookie(req, res) {

    let sessionCookie = req.cookies.__session;

    // const cookies = req.get('cookie') || '__session=';
    // const sessionCookie = cookie.parse(cookies).__session;

    console.log("verify cookie ....", sessionCookie);
    if (!sessionCookie) {
        res.status(200).json({success: false, message: "authentication failed"});
        return;
    }
    // res.setHeader('Access-Control-Allow-Origin', '*');
    if (!sessionCookie) {
        res.json({success: false});
        return;
    }
    firebaseAdmin.auth().verifySessionCookie(sessionCookie, true)
        .then((decodedClaims) => {
            console.log('Auth - verifySessionCookie success : ', decodedClaims);
            res.status(200).json({success: true});
        })
        .catch(error => {
            console.log('Auth - verifySessionCookie false : ', error);
            res.status(401).json({success: false});
        });
}

module.exports = verifySessionCookie;
