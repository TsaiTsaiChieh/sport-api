const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreAllModel');

async function livescore(req, res) {
  if (!req.query.time) {
    //out.time = Date.now();
    req.query.time = 1584982800000;
  }
  if (req.query.league === 'NBA') {
    req.query.sport = 'basketball';
  }
  if (req.query.league === 'MLB') {
    req.query.sport = 'baseball';
  }
  if (req.query.league === 'NHL') {
    req.query.sport = 'icehockey';
  }
  //soccer
  const schema = {
    required: ['league', 'sport'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA', 'MLB', 'NHL', 'soccer']
      },
      sport: {
        type: 'string',
        enum: ['basketball', 'baseball', 'icehockey', 'soccer']
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  try {
    res.json(await model(req.query));
  } catch (err) {
    res.status(err.code).json(err);
  }
}
module.exports = livescore;
/**
 * @api {GET} /livescore/livescore/all Get Livescore of all event
 * @apiVersion 1.0.0
 * @apiDescription [Test version] Get information of livescore in livescore page.
 * @apiName livescore information all
 * @apiGroup Livescore
 *
 * @apiParam {String} sport sport name, the value enum are: ```baseball```
 * @apiParam {String} league league name, the value enum are: ```MLB```
 * @apiParam {String} time timestamp, the value enum are: ```1585039500000```
 * @apiParam {String} category the category of event, the value enum are: ```all```
 * 
 * @apiParamExample {JSON} Request-Query
 {
   "sport" : "baseball"
   "league" : "MLB"
   "time" : 1585039500000
   "catrgory" : "all"
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
 * @apiSuccess {Object} stat information about hitter of team
 * @apiSuccess {String} stat.home the information of hitter about home team
 * @apiSuccess {String} stat.away the information of hitter about home team
 * @apiSuccess {Object} home the information about home team
 * @apiSuccess {Object} away the information about away team
 * @apiSuccess {Object} lineups the information of first pitcher
 * @apiSuccess {Object} lineups.home the information of first pitcher about home team
 * @apiSuccess {Object} lineups.away the information of first pitcher about away team
 * @apiSuccess {String} sport the name of sport
 * @apiSuccess {String} league the name of league
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
[
  {
    "totals": {
      "30000010": {
        "add_time": 1584515049000,
        "under_odd": 1.909,
        "handicap": 221,
        "over_odd": 1.909
      }
    },
    "flag": {
      "status": 2
    },
    "home": {
      "name_ch": "紐約洋基",
      "image_id": "3654"
    },
    "spread": {
      "30000009": {
        "add_time": 1584515049000,
        "home_odd": 1.909,
        "away_odd": 1.909,
        "handicap": 11
      }
    },
    "scheduled": {
      "_seconds": 1585040400,
      "_nanoseconds": 0
    },
    "radar_id": "40321",
    "bets_id": "20200321",
    "away": {
      "name_ch": "洛杉磯天使",
      "image_id": "5929"
    }
  },
  {
    "stat": {
      "home": {
        "h": 3,
        "obp": 3,
        "avg": 0.114,
        "r": 1,
        "hr": 2,
        "slg": 5
      },
      "away": {
        "h": 2,
        "obp": 8,
        "avg": 0.342,
        "r": 1,
        "hr": 7,
        "slg": 2
      }
    },
    "scheduled": {
      "_seconds": 1585039500,
      "_nanoseconds": 0
    },
    "radar_id": "40320",
    "away": {
      "name_ch": "多倫多藍鳥",
      "win": 8,
      "win_home": 7,
      "win_away": 1,
      "avg_lossscore": 2,
      "precent_OU": 40,
      "precent_spread": 60,
      "lose_away": 20,
      "image_id": 3642,
      "lose_home": 10,
      "lose": 30,
      "avg_getscore": 3
    },
    "bets_id": "20200320",
    "flag": {
      "status": 1
    },
    "totals": {
      "30000008": {
        "handicap": 220,
        "over_odd": 1.911,
        "add_time": 1584515049000,
        "under_odd": 1.911
      }
    },
    "home": {
      "precent_spread": 66,
      "lose_away": 15,
      "image_id": 3646,
      "lose_home": 10,
      "lose": 25,
      "avg_getscore": 5,
      "name_ch": "波士頓紅襪",
      "win": 12,
      "win_home": 7,
      "win_away": 5,
      "avg_lossscore": 7,
      "precent_OU": 50
    },
    "lineups": {
      "home": {
        "pitcher": {
          "id": "19900713",
          "jersey_number": "94",
          "lose": 24,
          "last_name": "Sam",
          "first_name": "Peter",
          "k": 32,
          "era": 0.332,
          "win": 12
        }
      },
      "away": {
        "pitcher": {
          "jersey_number": "83",
          "lose": 8,
          "last_name": "John",
          "first_name": "Smith",
          "k": 19,
          "era": 0.168,
          "win": 22,
          "id": "19940708"
        }
      }
    },
    "spread": {
      "30000007": {
        "away_odd": 1.91,
        "handicap": 10,
        "add_time": 1584515049000,
        "home_odd": 1.91
      }
    },
    "history": {
      "event4": {
        "scheduled": {
          "_seconds": 1584394200,
          "_nanoseconds": 0
        },
        "away": {
          "total_runs": 3
        },
        "totals": {
          "30000143": {
            "handicap": 14,
            "check": 1
          }
        },
        "spread": {
          "30000978": {
            "handicap": -2,
            "check": 0
          }
        },
        "home": {
          "total_runs": 2
        }
      },
      "event3": {
        "home": {
          "total_runs": 2
        },
        "scheduled": {
          "_seconds": 1584486000,
          "_nanoseconds": 0
        },
        "away": {
          "total_runs": 1
        },
        "totals": {
          "30000123": {
            "handicap": 12,
            "check": 0
          }
        },
        "spread": {
          "30000214": {
            "handicap": 4,
            "check": 1
          }
        }
      },
      "event0": {
        "totals": {
          "30000019": {
            "handicap": 12,
            "check": 0
          }
        },
        "spread": {
          "30000001": {
            "handicap": 3,
            "check": 1
          }
        },
        "home": {
          "total_runs": 5
        },
        "scheduled": {
          "_seconds": 1584838800,
          "_nanoseconds": 0
        },
        "away": {
          "total_runs": 9
        }
      },
      "event2": {
        "scheduled": {
          "_seconds": 1584558000,
          "_nanoseconds": 0
        },
        "away": {
          "total_runs": 3
        },
        "totals": {
          "30000145": {
            "handicap": 9,
            "check": 0
          }
        },
        "spread": {
          "30000121": {
            "handicap": 3,
            "check": 1
          }
        },
        "home": {
          "total_runs": 1
        }
      },
      "event1": {
        "scheduled": {
          "_seconds": 1584662400,
          "_nanoseconds": 0
        },
        "away": {
          "total_runs": 2
        },
        "totals": {
          "30000134": {
            "handicap": 11,
            "check": 1
          }
        },
        "spread": {
          "30000212": {
            "handicap": 2,
            "check": 0
          }
        },
        "home": {
          "total_runs": 1
        }
      }
    }
  },
  {
    "spread": {
      "30000005": {
        "handicap": 9,
        "add_time": 1584515049000,
        "home_odd": 1.912,
        "away_odd": 1.912
      }
    },
    "scheduled": {
      "_seconds": 1585038600,
      "_nanoseconds": 0
    },
    "radar_id": "40319",
    "bets_id": "20200319",
    "away": {
      "name_ch": "奧克蘭運動家",
      "image_id": 3645
    },
    "flag": {
      "status": 1
    },
    "totals": {
      "30000006": {
        "handicap": 219,
        "over_odd": 1.913,
        "add_time": 1584515049000,
        "under_odd": 1.913
      }
    },
    "home": {
      "name_ch": "休士頓太空人",
      "image_id": 3655
    }
  },
  {
    "totals": {
      "30000003": {
        "add_time": 1584515049000,
        "under_odd": 1.915,
        "handicap": 218,
        "over_odd": 1.915
      }
    },
    "flag": {
      "status": 0
    },
    "home": {
      "name_ch": "西雅圖水手",
      "image_id": 3641
    },
    "spread": {
      "30000002": {
        "handicap": 8,
        "add_time": 1584515049000,
        "home_odd": 1.914,
        "away_odd": 1.914
      }
    },
    "scheduled": {
      "_seconds": 1585037100,
      "_nanoseconds": 0
    },
    "radar_id": "40318",
    "bets_id": "20200318",
    "away": {
      "name_ch": "芝加哥白襪",
      "image_id": 3644
    }
  },
  {
    "sport": "baseball"
  },
  {
    "league": "MLB"
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
