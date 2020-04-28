// const userUtils = require('../../util/userUtil');
const db = require('../../util/dbUtil');
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
  "token":"eyJhbGciOiJSUzI1NiIsImtp..."
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
  const returnJson = { success: false };
  const token = req.body.token;
  const period = modules.getTitlesPeriod(new Date()).period;
  if (!token) {
    console.log('Error login user: missing token');
    res.status(401).json(returnJson);
    return;
  }

  firebaseAdmin
    .auth()
    .verifyIdToken(token)
    // eslint-disable-next-line promise/always-return
    .then(decodedIdToken => {
      // Create session cookie and set it.
      firebaseAdmin
        .auth()
        .createSessionCookie(token, { expiresIn: envValues.cookieOptions.maxAge })
        .then(async sessionCookie => {
          // const firestoreUser = await userUtils.getUserProfile(
          //   decodedIdToken.uid
          // );
          const mysqlUser = await db.sequelize.query(
            `
              SELECT *
                FROM users u, titles t
               WHERE u.uid = '${decodedIdToken.uid}'
             `,
            {
              plain: true,
              type: db.sequelize.QueryTypes.SELECT
            });

          const titlesQuery = await db.sequelize.query(
              `
                SELECT ml.name, ml.sport_id, t.rank_id 
                  FROM titles t, match__leagues ml
                 WHERE t.league_id = ml.league_id
                   AND uid = '${decodedIdToken.uid}'
                   AND period = '${period}'
               `,
              {
                type: db.sequelize.QueryTypes.SELECT
              });
              const titles = {};
              titlesQuery.forEach(function(data) { // 這裡有順序性
                titles[data.name]=repackage(data);
                mysqlUser.titles = titles;
              });
          returnJson.token = sessionCookie;
          returnJson.success = true;
          returnJson.status = 0;
          if (mysqlUser) {
            console.log('firestoreUser exist');
            if (mysqlUser.uid) {
              returnJson.uid = mysqlUser.uid;
            } else {
              res.status(401).json({ success: false });
            }
            if (mysqlUser.status) {
              returnJson.status = mysqlUser.status;
              returnJson.data = mysqlUser;
            }
          } else {
            returnJson.status = 0;
          }
          returnJson.data = mysqlUser;
          // res.cookie('__session', sessionCookie, envValues.cookieOptions);
          res.status(200).json(returnJson);
        })
        .catch(error => {
          console.log('Error login user: \n\t', error);
          res.status(401).json({ devcode: '004', err: 'missing token' });
        });
    })
    .catch(error => {
      console.log('Error login user: \n\t', error);
      res.status(401).json({ success: false });
    });
}
function repackage(ele) {
  const data = {};
  data.league = ele.name;
  data.sport = ele.sport_id.toString();
  data.rank = ele.rank_id.toString();

  return data;
}
module.exports = firebaseLogin;
