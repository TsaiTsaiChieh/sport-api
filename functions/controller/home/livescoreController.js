const modules = require('../../util/modules');
const model = require('../../model/home/livescoreModel');
async function livescore(req, res) {
  // inprogress : query from realtime database 只會顯示三場
  // 結束後依照league優先比重輪播（當該聯盟所有比賽都結束則自動更新成下一權重的比賽/手動選擇聯盟）
  // closed : query from firestore

  // 驗證

  let out = {};
  if (req.query.sport) {
    out.sport = req.query.sport;
  } else {
    out.sport = 'baseball';
  }
  if (req.query.league) {
    out.league = req.query.league;
  } else {
    out.league = 'MLB';
  }
  if (req.query.time) {
    out.time = req.query.time;
  } else {
    out.time = Date.now();
  }

  try {
    res.json(await model(out));
  } catch (err) {
    res.status(err.code).json(err);
  }
}

module.exports = livescore;
/**
 * @api {GET} /home/livescore?league=MLB Get Livescore
 * @apiVersion 1.0.0
 * @apiDescription [Test version] Get information of livescore in homepage, included score, handicap and information of team. Array of three match. 
 * @apiName livescore information
 * @apiGroup Home
 *
 * @apiParam {String} league league name, the value enum are: ```MLB```
 *
 * @apiParamExample {JSON} Request-Query
 {
   "league" : "MLB"
 }
 * @apiSuccess {String} bets_id match id in BetsAPI
 * @apiSuccess {String} radar_id match id in Sportradar
 * @apiSuccess {Object} spread information of speard
 * @apiSuccess {Object} spread id of spread
 * @apiSuccess {Number} spread.add_time the time of this spread add to firestore
 * @apiSuccess {Number} spread.home_odd the odd of home team about spread
 * @apiSuccess {Number} spread.away_odd the odd of away team about spread
 * @apiSuccess {Number} spread.handicap the handicap about spread
 * @apiSuccess {Object} scheduled the scheduled of this match
 * @apiSuccess {Number} scheduled._seconds unix timestamp
 * @apiSuccess {Object} totals id of spread
 * @apiSuccess {Number} totals.add_time the time of this totals add to firestore
 * @apiSuccess {Number} totals.home_odd the odd of home team about totals
 * @apiSuccess {Number} totals.away_odd the odd of away team about totals
 * @apiSuccess {Number} totals.handicap the handicap about totals
 * @apiSuccess {Object} flag id of spread
 * @apiSuccess {Number} flag.status 0:closed, 1:inprogress, 2:scheduled
 * @apiSuccess {Object} home information about home team
 * @apiSuccess {String} home.name_ch chinese name of home team
 * @apiSuccess {Number} home.image_id image id of home team (front-end need to combine url to get image)
 * @apiSuccess {Object} away information about away team
 * @apiSuccess {String} away.name_ch chinese name of away team
 * @apiSuccess {Number} away.image_id image id of away team (front-end need to combine url to get image)
 
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
[
  {
    "spread": {
      "30000007": {
        "away_odd": 1.91,
        "handicap": 20,
        "add_time": 1584515049000,
        "home_odd": 1.91
      }
    },
    "radar_id": "40320",
    "scheduled": {
      "_seconds": 1584607500,
      "_nanoseconds": 0
    },
    "away": {
      "name_ch": "多倫多藍鳥",
      "image_id": 3201
    },
    "bets_id": "20200320",
    "totals": {
      "30000008": {
        "over_odd": 1.911,
        "handicap": 320,
        "add_time": 1584515049000,
        "under_odd": 1.911
      }
    },
    "flag": {
      "status": 1
    },
    "home": {
      "name_ch": "波士頓紅襪",
      "image_id": 3200
    }
  },
  {
    "radar_id": "40319",
    "scheduled": {
      "_seconds": 1584606600,
      "_nanoseconds": 0
    },
    "away": {
      "name_ch": "奧克蘭運動家",
      "image_id": 3191
    },
    "bets_id": "20200319",
    "totals": {
      "30000006": {
        "add_time": 1584515049000,
        "under_odd": 1.913,
        "over_odd": 1.913,
        "handicap": 319
      }
    },
    "flag": {
      "status": 1
    },
    "home": {
      "name_ch": "休士頓太空人",
      "image_id": 3190
    },
    "spread": {
      "30000005": {
        "add_time": 1584515049000,
        "home_odd": 1.912,
        "away_odd": 1.912,
        "handicap": 19
      }
    }
  },
  {
    "radar_id": "40318",
    "scheduled": {
      "_seconds": 1584605100,
      "_nanoseconds": 0
    },
    "away": {
      "name_ch": "芝加哥白襪",
      "image_id": 3181
    },
    "bets_id": "20200318",
    "totals": {
      "30000003": {
        "add_time": 1584515049000,
        "under_odd": 1.915,
        "over_odd": 1.915,
        "handicap": 318
      }
    },
    "flag": {
      "status": 0
    },
    "home": {
      "image_id": 3180,
      "name_ch": "西雅圖水手"
    },
    "spread": {
      "30000002": {
        "add_time": 1584515049000,
        "home_odd": 1.914,
        "away_odd": 1.914,
        "handicap": 18
      }
    }
  }
]
 * @apiError 400 Bad Request ( Not inplement )
 * @apiError 500 Internal Server Error
 
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
