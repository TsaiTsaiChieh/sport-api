const ajv = require('../../util/ajvUtil');
const httpStatus = require('http-status');
const { acceptNumberAndLetter } = require('../../config/acceptValues');
const model = require('../../model/user/getTitlesAndSignatureModel');

async function getTitlesAndSignature(req, res) {
  const now = new Date();
  const schema = {
    type: 'object',
    required: ['uid'],
    properties: {
      uid: {
        type: 'string',
        pattern: acceptNumberAndLetter
      }
    }
  };

  const args = {
    now,
    uid: req.params.uid,
    token: req.token
  };

  const valid = ajv.validate(schema, args);
  if (!valid) return res.status(httpStatus.BAD_REQUEST).json(ajv.errors);

  try {
    res.json(await model(args));
  } catch (err) {
    console.error(
      'Error in controller/user/getTitlesAndSignatureController by TsaiChieh',
      err
    );
    res.status(err.code).json(err.error);
  }
}

module.exports = getTitlesAndSignature;

/**
 * @api {get} /user/getTitlesAndSignature/uid 聊天室-使用者簽名檔和當期所有稱號
 * @apiVersion 2.0.0
 * @apiDescription Get Titles And Signature by Tsai-Chieh
 *
 * @apiName getTitlesAndSignature
 * @apiGroup User
 *
 * @apiParam {String} uid user uid
 *
 * @apiParamExample {Number} uid Users unique ID
{ （正常大神資料）
    "uid": "Xw4dOKa4mWh3Kvlx35mPtAOX2P52",
    "role": "GOD",
    "display_name": "ㄘㄐ",
    "signature": "不是我不明白",
    "default_title": {
        "league_id": "2274",
        "rank_id": 1
    },
    "all_titles": {
        "titles": [
            {
                "league_id": "2274",
                "rank_id": 1
            },
            {
                "league_id": "3939",
                "rank_id": 2
            },
            {
                "league_id": "22000",
                "rank_id": 1
            }
        ]
    }
}
 *
* @apiParamExample {Number} uid Users unique ID
{（不正常的大神資料，因為 default_title 資料皆是 0，代表 user table 預設聯盟有誤，前端勿顯示預設稱號，麻煩回報再給後端，謝謝～）
    "uid": "Xw4dOKa4mWh3Kvlx35mPtAOX2P52",
    "role": "GOD",
    "display_name": "ㄘㄐ",
    "signature": "不是我不明白",
    "default_title": {
        "league_id": "0",
        "rank_id": 0
    },
    "all_titles": {
        "titles": [
            {
                "league_id": "2274",
                "rank_id": 1
            },
            {
                "league_id": "3939",
                "rank_id": 2
            },
            {
                "league_id": "22000",
                "rank_id": 1
            }
        ]
    }
}
 *
 * @apiError 404 Not Found
 * @apiError 500 Internal Server Error
 *
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