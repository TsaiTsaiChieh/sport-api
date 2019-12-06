const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;


/**
 * @api {post} /user/getUserProfile get User Profile
 * @apiVersion 1.0.0
 * @apiName getUserProfile
 * @apiGroup User
 * @apiPermission login user
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 *
 * @apiSuccess {JSON} success verify result success
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "uid": "Udbbbc6e025a2c2b217cf9a3df1482c04",
    "data": {
        "blockMessage": 0,
        "ingot": 0,
        "avatar": "https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg",
        "birthday": {
            "_seconds": 1573184036,
            "_nanoseconds": 370000000
        },
        "phone": "+886999999123",
        "dividend": 0,
        "referrer": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "coin": 0,
        "userStats": 1,
        "signature": "簽名檔3",
        "email": "test3q@email.com",
        "name": "真名line",
        "point": 333,
        "title": "一般會員",
        "displayName": "測試line",
        "denys": []
    },
    "userStats": 1
}
 *
 * @apiError TokenMissing session cookie not exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Token Missing
 *     missing token
 */
async function getUserProfile(req, res) {
    let sessionCookie = req.cookies.__session;
    console.log("test...");
    console.log(sessionCookie);
    if (!sessionCookie) return res.status(401).send("missing token");
    firebaseAdmin.auth().verifySessionCookie(
        sessionCookie, true)
        .then((decodedClaims) => {
            console.log('getUserProfile - verifySessionCookie success : ', decodedClaims);
            let uid = decodedClaims.uid;
            userUtils.getUserProfile(uid).then(async firestoreUser => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                return res.status(200).json(firestoreUser)
            }).catch(error => {
                console.log('getUserProfile - getUserProfile false : ', error);
                return res.status(500).send("error");
            });
        })
        .catch(error => {
            console.log('getUserProfile - verifySessionCookie false : ', error);
            return res.status(401).send("verify failed");
        });
}


module.exports = getUserProfile;