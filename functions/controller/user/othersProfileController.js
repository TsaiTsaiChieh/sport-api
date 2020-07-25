const modules = require('../../util/modules');
const ajv = require('../../util/ajvUtil');
const model = require('../../model/user/othersProfileModel');

async function othersProfile(req, res) {
  const now = new Date();
  const schema = {
    required: ['uid'],
    type: 'object',
    properties: {
      uid: {
        type: 'string',
        pattern: modules.acceptNumberAndLetter
      }
    }
  };

  const valid = ajv.validate(schema, req.query);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(ajv.errors);
  const args = {
    othersUid: req.query.uid,
    userUid: req.token ? req.token.uid : undefined,
    now
  };
  try {
    res.json(await model(args));
  } catch (err) {
    console.error('Error in controller/user/otherProfile by TsaiChieh', err);
    res.status(err.code).json(err.isPublic ? { error: err.name, devcode: err.status, message: err.message } : err.code);
  }
}

module.exports = othersProfile;

/**
 * @api {GET} /user/others_profile?uid=Xw4dOKa4mWh3Kvlx35mPtAOX2P52 個人預測頁-他人主頁
 * @apiVersion 1.0.0
 * @apiDescription Get other one profile by TsaiChieh
 * @apiName others profile
 * @apiGroup User
 *
 * @apiParam {String} Uid
 * @apiParam (Request cookie) {token} [__session] token generate from firebase Admin SDK
 *
 * @apiSampleRequest https://api-dosports.web.app/user/others_profile?uid=Xw4dOKa4mWh3Kvlx35mPtAOX2P52
 *
 * @apiSuccess {String} others_uid user id
 * @apiSuccess {String} avatar user picture URL
 * @apiSuccess {String} display_name display name
 * @apiSuccess {String} signature 使用者簽名檔
 * @apiSuccess {Number} fans 該關注對象的粉絲數量
 * @apiSuccess {Boolean} is_like 該關注對象是否是該登入使用者的最愛，`若使用者未登入即為 false`
 * @apiSuccess {Array} league 該關注對象是否是該登入使用者的追蹤聯盟，`若使用者未登入即為空陣列`
 * @apiSuccess {Number} status 該關注對象是否為大神，只要為任一聯盟的大神就為 2，只要是一般玩家 1，`others_league_id`, `others_league_name`, `others_rank`, `others_title` 皆為 null
 * @apiSuccess {Boolean} login_boolean 該使用者有無登入
 * @apiSuccess {String} others_league_id 該關注對象預設稱號的聯盟編號
 * @apiSuccess {String} others_league_name 該關注對象預設稱號的聯盟名
 * @apiSuccess {Number} others_rank 該關注對象的等級
 * @apiSuccess {Object} others_title 該關注對象預設稱號種類
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK (登入且觀察對象是大神)
 {
    "others_uid": "Xw4dOKa4mWh3Kvlx35mPtAOX2P52",
    "avatar": "https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/avatar%2FXw4dOKa4mWh3Kvlx35mPtAOX2P52%2F1583476511465763.jpeg?alt=media&token=34f5fef2-312f-47d3-9459-924b2a56832c",
    "display_name": "ㄘㄐ",
    "signature": "不是我不明白",
    "fans": 4,
    "is_like": true,
    "league": [
        "CPBL",
        "SBL"
    ],
    "status": 2,
    "login_boolean": true,
    "others_league_id": "2274",
    "others_league_name": "NBA",
    "others_rank": 1,
    "others_title": {
        "1": 22
    }
}
* @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK (未登入且觀察對象是大神)
 {
    "others_uid": "Xw4dOKa4mWh3Kvlx35mPtAOX2P52",
    "avatar": "https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/avatar%2FXw4dOKa4mWh3Kvlx35mPtAOX2P52%2F1583476511465763.jpeg?alt=media&token=34f5fef2-312f-47d3-9459-924b2a56832c",
    "display_name": "ㄘㄐ",
    "signature": "不是我不明白",
    "fans": 4,
    "is_like": false,
    "league": [],
    "status": 2,
    "login_boolean": false,
    "others_league_id": "2274",
    "others_league_name": "NBA",
    "others_rank": 1,
    "others_title": {
        "1": 22
    }
}
* @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK (未登入且觀察對象是一般玩家)
 {
    "others_uid": "l8DSG1GkKLgvkro0gI0FnxNY37k1",
    "avatar": "https://dosports.web.app/statics/default-avatar.jpg",
    "display_name": "UI/UX一般玩家",
    "signature": "1111",
    "fans": 0,
    "is_like": false,
    "league": [],
    "status": 1,
    "login_boolean": true,
    "others_league_id": null,
    "others_league_name": null,
    "others_rank": null,
    "others_title": null
}
 * @apiError 400 Bad Request
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
[
    {
        "keyword": "required",
        "dataPath": "",
        "schemaPath": "#/required",
        "params": {
            "missingProperty": "uid"
        },
        "message": "should have required property 'uid'"
    }
]
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
