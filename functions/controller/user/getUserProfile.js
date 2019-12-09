const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;


/**
 * @api {post} /user/getUserProfile Get User Profile
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
    "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
    "data": {
        "coin": 0,
        "signature": "簽名檔",
        "status": "1",
        "email": "req@email.com",
        "name": "真名",
        "point": "",
        "displayName": "測試displayName",
        "denys": [],
        "titles": [
            {
                "rank": 1,
                "league": "MLB",
                "sport": 16
            },
            {
                "rank": 3,
                "league": "CPBL",
                "sport": 16
            }
        ],
        "defaultTitle": {
            "rank": 1,
            "league": "MLB",
            "sport": 16
        },
        "blockMessage": 0,
        "ingot": 0,
        "avatar": "https://uploaded.firestorage.avatar.jpg",
        "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "birthday": {
            "_seconds": 1573194036,
            "_nanoseconds": 370000000
        },
        "phone": "+886999999999",
        "dividend": 0,
        "referrer": "bnKcVVaiIaUf3daVMNTTK5gH4hf1"
    },
    "status": "1"
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
            userUtils.getUserProfile(uid).then(firestoreUser => {
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