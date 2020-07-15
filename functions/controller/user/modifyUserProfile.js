const userUtils = require('../../util/userUtil');
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const admin = modules.firebaseAdmin;
const envValues = require('../../config/env_values');

async function modifyUserProfile(req, res) {
  const uid = req.token.uid;
  // const userSnapshot = await modules.getSnapshot("users", uid);
  const userSnapshot = await db.sequelize.query(
    `
      SELECT *
        FROM users
       WHERE uid = '${uid}'
     `,
    {
      plain: true,
      type: db.sequelize.QueryTypes.SELECT
    });
  const userStatus = userSnapshot != null ? userSnapshot.status : 0;
  const data = {};
  const nowTimeStamp = modules.moment().unix();
  data.display_name = req.body.display_name;
  data.name = req.body.name;
  data.country_code = req.body.country_code;
  data.phone = req.body.phone;
  data.email = req.body.email;
  data.birthday = req.body.birthday;
  data.uid = uid;
  switch (userStatus) {
    case 0: // 新會員
    {
      const schema = {
        type: 'object',
        required: ['display_name', 'name', 'phone', 'email', 'birthday'],
        properties: {
          display_name: { type: 'string', minLength: 2, maxLength: 15 },
          name: { type: 'string', minLength: 2, maxLength: 10 },
          country_code: { type: 'string', minLength: 2, maxLength: 4 },
          phone: { type: 'string', minLength: 9, maxLength: 10 },
          email: { type: 'string', format: 'email' },
          birthday: { type: 'integer' },
          avatar: { type: 'string', format: 'url' },
          signature: { type: 'string', maxLength: 20 }
        }
      };
      const valid = modules.ajv.validate(schema, data);
      data.birthday_tw = modules.moment.unix(data.birthday).subtract(1, "days").format('YYYY-MM-DD');

      // if (!valid) return res.status(400).json(modules.ajv.errors);
      if (!valid) {
        res.status(400).json(modules.ajv.errors);
        return;
      }

      // const uniqueNameSnapshot = await modules.firestore
      //   .collection('uniqueName')
      //   .doc(args.displayName)
      //   .get();
      // const uniqueEmailSnapshot = await modules.firestore
      //   .collection('uniqueEmail')
      //   .doc(args.email)
      //   .get();
      // const uniquePhoneSnapshot = await modules.firestore
      //   .collection('uniquePhone')
      //   .doc(args.phone)
      //   .get();
      // if (
      //   uniqueNameSnapshot.exists ||
      //   uniqueEmailSnapshot.exists ||
      //   uniquePhoneSnapshot.exists
      // ) {
      //   res.status(400).json({
      //     success: false,
      //     message: 'user name , email or phone exists'
      //   });
      //   return;
      // } else {
      //   modules.firestore
      //     .collection('uniqueName')
      //     .doc(args.displayName)
      //     .set({ uid: uid });
      //   modules.firestore
      //     .collection('uniqueEmail')
      //     .doc(args.email)
      //     .set({ uid: uid });
      //   modules.firestore
      //     .collection('uniquePhone')
      //     .doc(args.phone)
      //     .set({ uid: uid });
      // }

      // data.display_name = args.display_name; // only new user can set displayName, none changeable value
      // data.name = args.name; // only new user can set name(Actual name), none changeable value
      // data.phone = args.phone;

      // data.birthday = args.birthday;
      // data.birthday_tw = args.birthday_tw;
      if (!data.avatar) {
        data.avatar = `${envValues.productURL}statics/default-profile-avatar.jpg`;
      }

      data.status = 1;
      data.signature = '';

      // data.block_message = modules.moment.tz(data.block_message, modules.zone).format('YYYY-MM-DD HH:mm:ss');
      // data.createsTime = nowTimeStamp;
      // data.denys = [];
      data.coin = 0; // 搞幣
      data.dividend = 0; // 搞紅利
      data.ingot = 0; // 搞錠
      // data.titles = [];
      data.default_title = 0;
      data.point = 0;
      data.block_count = 0;
      data.accuse_credit = 20; // 檢舉信用值預設20，limit 100
      admin.auth().updateUser(uid, {
        // email: req.body.email,
        // phoneNumber: req.body.phone,
        display_name: req.body.display_name
      });
      admin.auth().setCustomUserClaims(uid, { role: 1, titles: [] });
      break;
    }
    case 1: // 一般會員
      // console.log('normal user');
      break;
    case 2: // 大神
      // console.log('godlike user');
      break;
    case -1: // 鎖帳號會員
      // console.log('blocked user');
      return res.status(400).json({ success: false, message: 'blocked user' });
    case 9: // 管理員
      // console.log('manager user');
      break;
    default:
      return res.status(401).json({ success: false, message: 'user status error' });
  }
  if (req.body.avatar) {
    data.avatar = req.body.avatar;
    admin.auth().updateUser(uid, {
      photoURL: req.body.avatar
    });
  }

  // if (req.body.email) data.email = req.body.email;
  // if (req.body.phone) data.phone = req.body.phone;
  if (req.body.signature) data.signature = req.body.signature;
  // if (req.body.title) data.defaultTitle = req.body.title;//移到另外API
  data.updateTime = nowTimeStamp;

  // 推薦碼（停用)
  // const refCode = req.body.refCode;
  // const userReferrer = userSnapshot.exists ? userSnapshot.referrer : undefined;
  // if (refCode && !userReferrer && refCode !== uid) {
  //   // refCode regular expression test
  //   // /^[a-zA-Z0-9]{28}$/g.test(refCode)
  //   // /^[U][a-f0-9]{32}$/g.test(refCode)
  //   if (
  //     /^[a-zA-Z0-9]{28}$/g.test(refCode) === true ||
  //     /^[U][a-f0-9]{32}$/g.test(refCode) === true
  //   ) {
  //     const referrerSnapshot = await modules.getSnapshot('users', refCode);
  //     if (referrerSnapshot.exists) {
  //       const referrerProfile = await referrerSnapshot.data();
  //       // process Ref Point
  //       // deny if refer each other
  //       if (referrerProfile.referrer !== uid && referrerProfile.status > 0) {
  //         console.log('set refCode give point: ', refCode);
  //         const userPoint = userSnapshot.exists ? userSnapshot.point : 0;
  //         data.point = userPoint + 200;
  //         data.referrer = refCode;
  //         resultJson.refPoint = data.point;
  //       }
  //     }
  //   }
  // }
  // console.log(data); return;
  // const display_name_unique = await db.User.findOne({
  //   where: {
  //     display_name: data.display_name
  //   },
  //   attributes: ['uid'],
  //   raw: true
  // });

  // if(display_name_unique!=null){
  //   reject({'error':'error'});
  // }
  // console.log('user profile updated : ', JSON.stringify(data, null, '\t'));
  await db.User.upsert(data)
    .then(async(ref) => {
      const resultJson = {};
      resultJson.data = await userUtils.getUserProfile(uid);
      resultJson.success = true;
      // console.log('Added document with ID: ', ref);
      return res.status(200).json(resultJson);
    })
    .catch((e) => {
      console.log('Added document with error: ', e);
      res.status(500).json({ success: false, message: 'update failed' });
    });// update or insert

  // res.json({success: true, result: writeResult});
}
module.exports = modifyUserProfile;

/**
 * @api {post} /user/modifyUserProfile Modify User Profile
 * @apiVersion 1.0.0
 * @apiName modifyUserProfile
 * @apiGroup User
 * @apiPermission login user
 *
 * @apiParam (Request cookie) {JWT} __session token generate from firebase Admin SDK
 * @apiParam (Request body) {URL} avatar URL of avatar from Firestorage
 * @apiParam (Request body) {String} name Actual name (Non changeable)
 * @apiParam (Request body) {String} displayName Nick Name (Unique,Non changeable)
 * @apiParam (Request body) {String} phone mobile number with area code (Unique,Non changeable)
 * @apiParam (Request body) {String} email email address (Unique,Non changeable)
 * @apiParam (Request body) {Number} birthday birthday UTC timestamp (Non changeable)
 * @apiParam (Request body) {String} signature signature
 * @apiParam (Request body) {String} refCode UID of referrer (Non changeable)
 * @apiParam (Request body) {JSON} title default title example : {"league":"MLB","rank":1,"sport":16}
 *
 * @apiParamExample {JSON} Request-Example
 * {
 *    "displayName":"ㄘㄐ",
 *    "name":"自己打不要學我",
 *    "phone": "+886222222222",
 *    "email":"xxx@gmail.com",
 *    "birthday":1581988872411
 * }
 *
 * @apiSuccess {JSON} result Execute Result
 *
 * @apiSuccessExample New User:
 *  HTTP/1.1 200 OK
 {
    "refPoint": 200,
    "data": {
        "success": true,
        "uid": "sfoepr8QRORSUfs8tZFa3zO7SN23",
        "data": {
            "blockMessage": {
                "_seconds": 1577676856,
                "_nanoseconds": 649000000
            },
            "ingot": 0,
            "avatar": "https://i.imgur.com/EUAd2ht.jpg",
            "uid": "sfoepr8QRORSUfs8tZFa3zO7SN23",
            "birthday": {
                "_seconds": 1543182036,
                "_nanoseconds": 370000000
            },
            "phone": "+886999999999",
            "dividend": 0,
            "referrer": "40lFV6SJAVYpw0zZbIuUp7gL9Py2",
            "point": 200,
            "coin": 0,
            "signature": "世界很快我很慢",
            "status": 1,
            "blockCount": 0,
            "email": "rex@gets-info.com",
            "name": "rex",
            "accuseCredit": 20,
            "displayName": "qqqq",
            "denys": [],
            "titles": [],
            "createTime": {
                "_seconds": 1577676856,
                "_nanoseconds": 649000000
            },
            "defaultTitle": {
                "league": "MLB",
                "sport": 16,
                "rank": 1
            },
            "updateTime": {
                "_seconds": 1577676856,
                "_nanoseconds": 649000000
            }
        },
        "status": 1
    },
    "success": true
}
 *
 *
 * @apiError TokenMissing session cookie not exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Token Missing
 {
    "success": false,
    "message": "getUserProfile failed"
 }
 */
