const userUtils = require('../../util/userUtil');

/**
 * @api {post} /user/getUserProfile Get User Profile
 * @apiVersion 1.0.0
 * @apiName getUserProfile
 * @apiGroup User
 * @apiPermission login user
 *
 * @apiParam (Request cookie) {JWT} __session token generate from firebase Admin SDK
 *
 * @apiSuccess {JSON} user User Profile JSON
 *
 * @apiSuccessExample New User:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "uid": "lz3c3ju6G0TilDOdgCQt4I7I8ep1",
    "status": 0
 }
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
    "data": {
        "blockMessage": {
            "_seconds": 1575907200,
            "_nanoseconds": 0
        },
        "ingot": 0,
        "avatar": "https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg",
        "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "birthday": {
            "_seconds": 1573194036,
            "_nanoseconds": 370000000
        },
        "phone": "+886999999123",
        "dividend": 0,
        "referrer": "bnKcVVaiIaUf3daVMNTTK5gH4hf1",
        "coin": 0,
        "signature": "簽名檔33",
        "status": 1,
        "email": "test3q@email.com",
        "name": "真名",
        "point": 250,
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
        }
    },
    "status": 1
}
 *
 * @apiError TokenMissing session cookie not exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Token Missing
 *     missing token
 */
async function getUserProfile(req, res) {
  const uid = req.token.uid;
  userUtils.getUserProfile(uid).then(firestoreUser => {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(firestoreUser);
  }).catch(error => {
    console.log('getUserProfile - getUserProfile false : ', error);
    return res.status(500).send('error');
  });
}

module.exports = getUserProfile;
