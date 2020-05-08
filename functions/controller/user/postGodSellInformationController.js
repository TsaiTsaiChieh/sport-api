const modules = require('../../util/modules');
const model = require('../../model/user/postGodSellInformationModel');

async function godSellInformation(req, res) {
  const now = new Date();
  const schema = {
    type: 'object',
    required: ['league', 'date', 'desc', 'tips'],
    properties: {
      league: {
        type: 'string',
        enum: modules.acceptLeague
      },
      date: {
        type: 'string',
        format: 'date'
      },
      desc: {
        type: 'string',
        pattern:
          '^[ \u4e00-\u9fa5_a-zA-Z0-9\u3105-\u3129\u02CA\u02C7\u02CB\u02D9<>，,。.:：!！;；*＊()（）「」『』@#＃&＆+-=%％]+$', // 允許中英文底線空格特殊符號
        minLength: 0,
        maxLength: 100
      },
      tips: {
        type: 'string',
        pattern:
          '^[ \u4e00-\u9fa5_a-zA-Z0-9\u3105-\u3129\u02CA\u02C7\u02CB\u02D9<>，,。.:：!！;；*＊()（）「」『』@#＃&＆+-=%％]+$', // 允許中英文底線空格特殊符號
        minLength: 0,
        maxLength: 500
      }
    }
  };
  const args = {
    token: req.token,
    league: req.body.league,
    date: req.body.date,
    desc: req.body.desc,
    tips: req.body.tips,
    now
  };
  const valid = modules.ajv.validate(schema, args);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  }

  try {
    res.json(await model(args));
  } catch (err) {
    console.error(
      'Error in controller/user/postGodSellInformation function by TsaiChieh',
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
 * @api {POST} /user/sell_information Post sell information
 * @apiVersion 1.0.0
 * @apiDescription Post sell information included description(說明文) and tips(武功秘笈) by TsaiChieh
 * @apiName Post sell information
 * @apiGroup User
 *
 * @apiParam {String} prematch date, ex: `2020-07-01`
 * @apiParam {String} league league name, the value enum are: `NBA`, `eSoccer`, `KBO`
 * @apiParam {String} desc 說明文
 * @apiParam {String} tips 武功秘笈
 *
 * @apiParamExample {JSON} Request-Query
{
	"league": "NBA",
	"date": "2020-07-01",
	"desc": "我預測得超好",
	"tips": "買了就送你myprecious"
}
 * @apiSuccess {String} response
 *
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
