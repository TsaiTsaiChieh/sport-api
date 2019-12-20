const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');
const firebaseAdmin = modules.firebaseAdmin;
const envValues = require('../../config/env_values');

/**
 * @api {post} /auth/login create session cookie
 * @apiVersion 1.0.0
 * @apiName login
 * @apiGroup Auth
 * @apiPermission login user
 *
 * @apiParam (Request body) {token} token token generate from firebase SDK
 *
 * @apiSuccess {cookie} __session session cookie
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
 * {
  "success": true,
  "status": 1,
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
    "signature": "下輩子當貓好了",
    "status": 1,
    "email": "test3q@email.com",
    "name": "真名",
    "point": 250,
    "displayName": "愛心喵",
    "denys": [],
    "titles": [
      {
        "league": "MLB",
        "sport": 16,
        "rank": 1
      },
      {
        "rank": 3,
        "league": "CPBL",
        "sport": 16
      }
    ],
    "createTime": {
      "_seconds": 1575216000,
      "_nanoseconds": 0
    },
    "updateTime": {
      "_seconds": 1575129600,
      "_nanoseconds": 0
    },
    "defaultTitle": {
      "rank": 1,
      "league": "MLB",
      "sport": 16
    }
  }
}
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
    // res.setHeader('Access-Control-Allow-Origin', '*');
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
                    returnJson.status = 0;
                    if (firestoreUser) {
                        console.log("firestoreUser exist");
                        if (firestoreUser.uid) {
                            returnJson.uid = firestoreUser.uid;
                        } else {
                            return res.status(401).json({success: false})
                        }
                        if (firestoreUser.status) {
                            returnJson.status = firestoreUser.status;
                            returnJson.data = firestoreUser.data;
                        }
                    } else {
                        returnJson.status = 0;
                    }
                    returnJson.data = firestoreUser.data;
                    // let options = {maxAge: expiresIn, httpOnly: true};
                    let options = {
                        maxAge: expiresIn,
                        httpOnly: true,
                        sameSite: 'none',
                        // domain: envValues.domain
                    };

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