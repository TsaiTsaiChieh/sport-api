const { ajv } = require('../../util/modules');
// const missionModel = require('../../model/mission/missionModel');
const missionDailyModel = require('../../model/mission/missionDailyModel');
const missionActivityModel = require('../../model/mission/missionActivityModel');

async function mission(req, res) {
  const schema = {
    type: 'object',
    required: ['type'],
    properties: {
      type: {
        type: 'string',
        enum: ['daily', 'adv', 'activity']
      }
    }
  };

  const valid = ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(400).json(ajv.errors);
  }

  try {
    req.body.token = req.token; // 從 cookie 取得 __session 中 token

    switch (req.query.type) {
      case 'daily':
        res.json(await missionDailyModel(req.body));
        break;
      case 'activity':
        res.json(await missionActivityModel(req.body));
        break;
    }
  } catch (err) {
    console.error('[missionController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = mission;
/**
 * @api {get} /mission Get Mission List
 * @apiVersion 1.0.0
 * @apiName Get User Mission List
 * @apiGroup Mission
 * @apiPermission None
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiSuccess {JSON} result User Mission Lists
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
{
  "daily": [
    {
      "title": "當日發文 1篇",
      "desc": "發表 一篇 投注分享/賽事分析/球隊討論 類型文章\n即可獲得獎勵",
      "start_date": 1577808000,
      "end_date": 1609415999,
      "item_id": 1,
      "target": "topic",
      "reward_class": 0,
      "reward_type": "ingot",
      "reward_num": 10,
      "reward_class_num": "",
      "status": 0,
      "need_finish_nums": 1,
      "now_finish_nums": 0
    },
    {
      "title": "當日預測5場賽事",
      "desc": "不限定聯盟，預測5場賽事。",
      "start_date": 1577808000,
      "end_date": 1609415999,
      "item_id": 2,
      "target": "predict",
      "reward_class": 0,
      "reward_type": "ingot",
      "reward_num": 5,
      "reward_class_num": "",
      "status": 0,
      "need_finish_nums": 5,
      "now_finish_nums": 0
    }
  ]
}
{
  "activity": [
    {
      "title": "首次晉升成大神",
      "desc": "鑽石大神：20 搞錠\n金牌大神：19 搞錠\n銀牌大神：18 搞錠\n銀牌大神：17 搞錠",
      "start_date": 1594051200,
      "end_date": 1594396799,
      "item_id": 1,
      "target": "predict",
      "reward_class": 1,
      "reward_type": "Ingot",
      "reward_num": 20,
      "reward_class_num": 17,
      "status": 0,
      "need_finish_nums": 1,
      "now_finish_nums": 0
    },
    {
      "title": "首次儲值100000獎金讓你抽",
      "desc": "首次儲值達 288 搞幣以上，送一張摸獎券。",
      "start_date": 1594051200,
      "end_date": 1594396799,
      "item_id": 1,
      "target": "buy",
      "reward_class": 0,
      "reward_type": "lottery",
      "reward_num": 1,
      "reward_class_num": "",
      "status": 0,
      "need_finish_nums": 1,
      "now_finish_nums": 0
    }
  ]
}
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
  {
    "keyword": "enum",
    "dataPath": ".type",
    "schemaPath": "#/properties/type/enum",
    "params": {
      "allowedValues": [
        "daily",
        "adv",
        "activity"
      ]
    },
    "message": "should be equal to one of the allowed values"
  }
]
 *
 *
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *
 */
