const modules = require('../../util/modules');
const model = require('../../model/user/othersProfileModel');

async function othersProfile(req, res) {
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

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  const args = {
    othersUid: req.query.uid,
    userUid: req.token.uid
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
 * @api {GET} /user/others_profile?uid=ag3wOqvuHUQ3GDqT2LeZG7rhlRa2 Get other one profile
 * @apiVersion 1.0.0
 * @apiDescription Get other one profile by TsaiChieh
 * @apiName others profile
 * @apiGroup User
 *
 * @apiParam {String} Uid
 *
 * @apiSuccess {String} uid user id
 * @apiSuccess {String} avatar user picture URL
 * @apiSuccess {String} user display name
 * @apiSuccess {String} user signature
 * @apiSuccess {Number} others fans number
 * @apiSuccess {Boolean} this person is the login user's favorite?
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 {
    "uid": "Xw4dOKa4mWh3Kvlx35mPtAOX2P52",
    "avatar": "https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/avatar%2FXw4dOKa4mWh3Kvlx35mPtAOX2P52%2F1583476511465763.jpeg?alt=media&token=34f5fef2-312f-47d3-9459-924b2a56832c",
    "display_name": "ㄘㄐ",
    "signature": "不是我不明白",
    "fans": 0,
    "is_like": true
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
