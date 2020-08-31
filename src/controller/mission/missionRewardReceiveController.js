const ajv = require('../../util/ajvUtil');
const missionRewardReceiveModel = require('../../model/mission/missionRewardReceiveModel');

async function mission(req, res) {
  const schema = {
    type: 'object',
    required: ['id', 'type'],
    properties: {
      id: {
        type: 'integer'
      },
      type: {
        type: 'string',
        enum: ['mission_item', 'mission_god', 'mission_deposit']
      }
    }
  };

  const isNumber = value => !isNaN(parseFloat(value)) && isFinite(value); // 處理 get number 問題
  if (isNumber(req.query.id)) req.query.id = parseInt(req.query.id);

  const valid = ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(400).json(ajv.errors);
  }

  try {
    req.body.token = req.token; // 從 cookie 取得 __session 中 token
    res.json(await missionRewardReceiveModel(req));
  } catch (err) {
    console.error('[missionRewardReceiveController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = mission;
/**
 * @api {get} /missionRewardReceive Mission Reward Receive
 * @apiVersion 1.0.0
 * @apiName Mission Reward Receive
 * @apiGroup Mission
 * @apiPermission None
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiSuccess {JSON} result status ok
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
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
  {
    "keyword": "type",
    "dataPath": ".item_id",
    "schemaPath": "#/properties/item_id/type",
    "params": {
      "type": "integer"
    },
    "message": "should be integer"
  },
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
