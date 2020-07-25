const ajv = require('../../util/ajvUtil');
const httpStatus = require('http-status');
const model = require('../../model/user/getGodSellInformationModel');
const { acceptNumberAndLetter } = require('../../config/acceptValues');

async function godSellInformation(req, res) {
  const schema = {
    type: 'object',
    required: ['league', 'date'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA', 'eSoccer']
      },
      date: {
        type: 'string',
        format: 'date'
      },
      uid: {
        type: 'string',
        pattern: acceptNumberAndLetter
      }
    }
  };
  const args = {
    token: req.token,
    league: req.query.league,
    date: req.query.date,
    uid: req.query.uid
  };
  const valid = ajv.validate(schema, args);
  if (!valid) {
    return res.status(httpStatus.BAD_REQUEST).json(ajv.errors);
  }

  try {
    res.json(await model(args));
  } catch (err) {
    console.error(
      'Error in controller/user/getGodSellInformation function by TsaiChieh',
      err
    );
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}

module.exports = godSellInformation;
/**
 * @api {GET} /user/sell_information?league=NBA&date=2020-07-01&uid=Xw4dOKa4mWh3Kvlx35mPtAOX2P52 Post sell information
 * @apiVersion 1.0.0
 * @apiDescription Get sell information included description(說明文) and tips(武功秘笈) by TsaiChieh
 * @apiName Get sell information
 * @apiGroup User
 *
 * @apiParam {String} prematch date, ex: ```2020-07-01```
 * @apiParam {String} league league name, the value enum are: ```NBA```
 * @apiParam {String} uid user id
 *
 * @apiSuccess {String} response
 * {
    "desc": "大家快來買我的牌，我預測了超多！我又新增了兩場喔",
    "tips": "買了就送你 my precious"
}
 * @apiSuccess {String} response
 * {}
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * "Upsert successful"
 *
 * @apiError 400 Bad Request
 * @apiError 401 Unauthorized
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
    {
        "keyword": "enum",
        "dataPath": ".league",
        "schemaPath": "#/properties/league/enum",
        "params": {
            "allowedValues": [
                "NBA"
            ]
        },
        "message": "should be equal to one of the allowed values"
    }
]
 *
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
