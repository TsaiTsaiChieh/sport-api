const { ajv } = require('../../util/modules');
const settleWinListModel = require('../../model/user/settleWinListModel');

async function settleWinList(req, res) {
  const schema = {
    type: 'object',
    required: ['date'],
    properties: {
      date: {
        type: 'string',
        format: 'date'
      }
    }
  };

  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    return res.status(400).json(ajv.errors);
  }

  try {
    req.body.token = req.token;

    res.json(await settleWinListModel(req.body));
  } catch (err) {
    console.error(err);
    res.status(err.code).json(err.err);
  }
}

module.exports = settleWinList;
/**
 * @api {get} /settleWinList Settle Win List
 * @apiVersion 1.0.0
 * @apiName settleWinList
 * @apiGroup User
 * @apiPermission None
 *
 * @apiParam (Request header) {Authorization} Authorization bearer token generate from firebase Admin SDK
 * @apiParam (Request body) {date} date date
 * @apiSuccess {JSON} result Settle Win List success
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
{
  "status": {
    "1": {
      "msg": "使用者-聯盟 歷史勝注勝率資料更新成功！",
      "lists": [
        {
          "uid": "2WMRgHyUwvTLyHpLoANk7gWADZn1",
          "league": 3939
        },
        {
          "uid": "3IB0w6G4V8QUM2Ti3iCIfX4Viux1",
          "league": 3939
        }
      ]
    },
    "2": {
      "msg": "使用者-聯盟 勝注勝率資料更新成功！",
      "lists": [
        {
          "uid": "2WMRgHyUwvTLyHpLoANk7gWADZn1",
          "league": 3939
        },
        {
          "uid": "3IB0w6G4V8QUM2Ti3iCIfX4Viux1",
          "league": 3939
        }
      ]
    }
  }
}
 *
 * @apiError 404
 *
 * @apiErrorExample {JSON} Error-1301
 * HTTP/1.1 404 Not Found
 * {
    "code": "1301",
    "msg": "使用者狀態異常"
 * }
 *
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *
 */
