const modules = require('../../util/modules');
const ajv = require('../../util/ajvUtil');
const model = require('../../model/user/predictionResultsModel');

async function predictionResult(req, res) {
  const schema = {
    type: 'object',
    required: ['date', 'uid'],
    properties: {
      date: {
        type: 'string',
        format: 'date',
        // default value is today
        default: modules.convertTimezoneFormat(Math.floor(Date.now() / 1000),
          { format: 'YYYY-MM-DD' })
      },
      uid: {
        type: 'string',
        pattern: modules.acceptNumberAndLetter,
        default: req.query.uid ? req.query.uid : (req.token ? req.token.uid : req.token)
      }
    }

  };

  const valid = ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(ajv.errors);
  }

  const args = {
    date: req.query.date,
    uid: schema.properties.uid.default
  };
  try {
    res.json(await model(args));
  } catch (err) {
    console.error(err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}

module.exports = predictionResult;
/**
 * @api {post} /user/prediction_result 個人預測頁-預測結果
 * @apiVersion 2.0.0
 * @apiDescription User check own prediction form which is settled by Tsai-Chieh
 * @apiName Check own prediction form
 * @apiGroup User
 * @apiPermission login user with completed data
 *
 * @apiParam {String} [date] date, ex: `2020-07-01`
 *
 * @apiSampleRequest /user/prediction_result?date=2020-07-01&uid=Xw4dOKa4mWh3Kvlx35mPtAOX2P52
 * @apiSampleRequest /user/prediction_result
 *
 * @apiSuccess {Object} body 有下注的各聯盟內容
 * @apiSuccess {Array} each_league ex: 聯盟種類，ex: `eSoccer`, `NBA`, ...
 * @apiSuccess {String} id 賽事編號
 * @apiSuccess {String} match_status 賽事的狀態，2 未來賽事，1 正在打，0 結束，-1 延遲（API 問題），-2 延後，-3 取消
 * @apiSuccess {Number} scheduled 賽事開打時間的 unix 表示法
 * @apiSuccess {String} league_id 聯盟編號
 * @apiSuccess {Object} home 主隊資訊（客隊資訊同邏輯，不再贅述）
 * @apiSuccess {String} home.id 主隊編號
 * @apiSuccess {String} home.alias 主隊簡稱
 * @apiSuccess {String} home.alias_ch 主隊中文簡稱
 * @apiSuccess {String} home.player_name 主隊隊員名（通常只有電競足球只欄位才會有值）
 * @apiSuccess {Number} home.points 主隊最終得分
 * @apiSuccess {Object} spread 讓分物件，`若使用者未下注讓分，則此物件幾乎會是 null`
 * @apiSuccess {String} spread.id 讓分編號
 * @apiSuccess {Number} spread.handicap 讓分原始盤口（前端不用顯示，給後端 Debug）
 * @apiSuccess {String} spread.home_tw 讓分主隊台盤顯示（通常主隊顯示客隊就不顯示）
 * @apiSuccess {String} spread.away_tw 讓分客隊台盤顯示（通常客隊顯示主隊就不顯示）
 * @apiSuccess {String} spread.predict 使用者當初下注對象，ex: 主 (home) or 客 (away)
 * @apiSuccess {Number} spread.ori_bets 使用者最初下注的注數
 * @apiSuccess {Number} spread.ori_bets 使用者最初下注的注數
 * @apiSuccess {Number} spread.result 讓分的過盤結果（已乘上固定賠率）：-2 未結算（可能比賽未如預期結束或是程式有問題）、-1（輸）、0（平手）、0.95（贏）、0.5（贏）、-0.5（輸），詳細規則 ref from https://docs.google.com/document/d/1n06wVoPZ94OwC1Ri_9t4MlVI2ukjt4QijT3Z1qEMta8/edit
 * @apiSuccess {Number} spread.end 可藉由此欄位直接判定過盤結果：1 有無過盤、0 平盤、-1 未過盤，`若 result 是 -2，則此欄位會是 null`
 * @apiSuccess {Number} spread.bets 注數乘以賠率（前端可顯示這個即可），`若 result 是 -2，則此欄位會是 null`
 * @apiSuccess {Object} totals 大小分物件（和讓分邏輯很雷同，以下只描述不同之細節），`若使用者未下注大小分，則此物件所有會是 null`
 * @apiSuccess {String} totals.over_tw 大分台盤顯示（和讓分不同，大小分只在大分顯示即可）
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
{
    "eSoccer": [
        {
            "id": "2331650",
            "match_status": 0,
            "scheduled": 1593558000,
            "scheduled_tw": "07:00 AM",
            "league_id": "22000",
            "home": {
                "id": "332756",
                "alias": "Kenny Bell FC",
                "alias_ch": "Kenny Bell FC",
                "player_name": null,
                "points": 1
            },
            "away": {
                "id": "332755",
                "alias": "Boston River",
                "alias_ch": "Boston River",
                "player_name": null,
                "points": 0
            },
            "spread": {
                "id": "50150778",
                "handicap": 1,
                "home_tw": "主讓1分平",
                "away_tw": null,
                "predict": "away",
                "ori_bets": 1,
                "result": -2,
                "end": null,
                "bets": null
            },
            "totals": {
                "id": null,
                "handicap": null,
                "over_tw": null,
                "predict": null,
                "ori_bets": null,
                "result": null
            }
        }
    ],
    "NBA": [
        {
            "id": "2118058",
            "match_status": 0,
            "scheduled": 1593558000,
            "scheduled_tw": "07:00 AM",
            "league_id": "2274",
            "league": "NBA",
            "home": {
                "id": "54379",
                "alias": "LAL",
                "alias_ch": "湖人",
                "player_name": null,
                "points": 102
            },
            "away": {
                "id": "54759",
                "alias": "BKN",
                "alias_ch": "籃網",
                "player_name": null,
                "points": 104
            },
            "spread": {
                "id": "31247649",
                "handicap": 12,
                "home_tw": "12平",
                "away_tw": null,
                "predict": "away",
                "ori_bets": 1,
                "result": 0.95,
                "end": 1,
                "bets": 0.95
            },
            "totals": {
                "id": "34366105",
                "handicap": 225.5,
                "over_tw": "225.5",
                "predict": "under",
                "ori_bets": 2,
                "result": 0.95,
                "end": 1,
                "bets": 1.9
            }
        },
        {
            "id": "2119917",
            "match_status": 0,
            "scheduled": 1593565200,
            "scheduled_tw": "09:00 AM",
            "league_id": "2274",
            "league": "NBA",
            "home": {
                "id": "54379",
                "alias": "LAL",
                "alias_ch": "湖人",
                "player_name": null,
                "points": null
            },
            "away": {
                "id": "52640",
                "alias": "HOU",
                "alias_ch": "火箭",
                "player_name": null,
                "points": null
            },
            "spread": {
                "id": "31296152",
                "handicap": 6.5,
                "home_tw": "6輸",
                "away_tw": null,
                "predict": "home",
                "ori_bets": 3,
                "result": -1,
                "end": -1,
                "bets": -3
            },
            "totals": {
                "id": "34452129",
                "handicap": 231.5,
                "over_tw": "231.5",
                "predict": "over",
                "ori_bets": 1,
                "result": -2,
                "end": null,
                "bets": null
            }
        }
    ]
}

 * @apiError 400 Bad Request
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
