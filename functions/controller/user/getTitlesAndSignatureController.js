/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const model = require('../../model/user/getTitlesAndSignatureModel');

async function getTitlesAndSignature (req, res) {
  const schema = {
    type: 'object',
    required: ['uid'],
    properties: {
      uid: {
        type: 'string'
      }
    }
  };
  const args = {};
  args.uid = req.params.uid;
  const validate = modules.ajv.validate(schema, args);
  if (!validate) return res.status(400).json(modules.ajv.errors);
  args.token = req.token;

  try {
    res.json(await model(args));
  } catch (err) {
    console.log(
      'Error in controller/user/getTitlesAndSignatureController fucntion by TsaiChieh',
      err
    );
    res.status(err.code).json(err.error);
  }
}

module.exports = getTitlesAndSignature;

/**
 * @api {get} /user/getTitlesAndSignature/:uid Get Titles And Signature
 * @apiVersion 1.0.1
 * @apiDescription 看使用者的的頭銜和點數 by Tsai-Chieh
 *
 * @apiName getTitlesAndSignature
 * @apiGroup User
 *
 * @apiParam {String} uid user uid
 *
 * @apiParamExample {Number} uid Users unique ID
 * {
 *    "uid": X6umtiqFyRfcuJiKfjsFXrWqICc2
 * }
 * @apiSuccessExample {JSON} Request-Example
 *  HTTP/1.1 200 OK
{
    "uid": "Xw4dOKa4mWh3Kvlx35mPtAOX2P52",
    "signature": "",
    "role": "GOD"
    "titles": [
        {
            "rank": 1,
            "league": "NBA",
            "sport": 18
        },
        {
            "rank": 1,
            "league": "CBA",
            "sport": 18
        }
    ],
    "record": {
        "rank1_count": 2,
        "rank2_count": 0,
        "rank3_count": 0,
        "rank4_count": 0
    }
}
 *
 * @apiError 401 Unauthorized
 * @apiError 404 Not Found
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 401-Response
 * HTTP/1.1 401 Unauthorized
 * {
    "code": 401,
    "error": "Unauthorized"
}
 * @apiErrorExample {JSON} 404-Response
 * HTTP/1.1 404 Not Found
{
    "code": 404,
    "error": {
        "devcode": 1305,
        "msg": "user status abnormal"
    }
}
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
