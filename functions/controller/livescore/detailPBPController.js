const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreDetailPBPModel');

async function livescore(req, res) {
  if (!req.query.category) {
    req.query.category = 'pbp';
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
    required: ['league', 'sport', 'category', 'eventID'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA', 'MLB', 'NHL', 'soccer'],
      },
      sport: {
        type: 'string',
        enum: ['basketball', 'baseball', 'icehockey', 'soccer'],
      },
      eventID: {
        type: 'string',
      },
      category: {
        type: 'string',
      },
    },
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
 * @api {GET} /livescore/livescore/detail/pbp Get the pbp of event
 * @apiVersion 1.0.0
 * @apiDescription [Test version] pbp information of event
 * @apiName livescore detail/pbp
 * @apiGroup Livescore
 *
 * @apiParam {String} sport sport name, the value are: ```baseball```
 * @apiParam {String} league league name, the value are: ```MLB```
 * @apiParam {String} eventID ID of event, the value are: ```20200320```
 * 
 * @apiParamExample {JSON} Request-Query
 {
   'sport' : 'baseball'
   'league' : 'MLB'
   'eventID' : '20200320'
 }
* @apiSuccess {Object} flag status of event 
* @apiSuccess {Number} flag.status 0:closed, 1:inprogress, 2:closed 
* @apiSuccess {Object} totals totals handicap and odds
* @apiSuccess {Number} totals.add_time the time of handicap added
* @apiSuccess {Number} totals.under_odd under odd
* @apiSuccess {Number} totals.over_odd over odd
* @apiSuccess {Number} totals.handicap U/O handicap
* @apiSuccess {Object} home information of home team
* @apiSuccess {Number} home.image_id image_id of home team
* @apiSuccess {Number} home.lose_home home team lose at home side
* @apiSuccess {Number} home.lose home team total lose
* @apiSuccess {Number} home.avg_getscore average score of home team
* @apiSuccess {Number} home.name_ch chinese name of home team
* @apiSuccess {Number} home.win home team total win
* @apiSuccess {Number} home.win_home home team win at home side
* @apiSuccess {Number} home.win_away home team win at away side
* @apiSuccess {Number} home.avg_lossscore average lossscore of home team
* @apiSuccess {Number} home.precent_OU check precent of OU of home team
* @apiSuccess {Number} home.precent_spread check precent of spread of home team
* @apiSuccess {Number} home.lose_away home team lose at away side
* @apiSuccess {Object} away information of away team
* @apiSuccess {Number} away.image_id image_id of away team
* @apiSuccess {Number} away.lose_home away team lose at home side
* @apiSuccess {Number} away.lose away team total lose
* @apiSuccess {Number} away.avg_getscore average score of away team
* @apiSuccess {Number} away.name_ch chinese name of away team
* @apiSuccess {Number} away.win away team total win
* @apiSuccess {Number} away.win_home away team win at home side
* @apiSuccess {Number} away.win_away away team win at away side
* @apiSuccess {Number} away.avg_lossscore average lossscore of away team
* @apiSuccess {Number} away.precent_OU check precent of OU of away team
* @apiSuccess {Number} away.precent_spread check precent of spread of away team
* @apiSuccess {Number} away.lose_away away team lose at away side
* @apiSuccess {Object} lineups information of player
* @apiSuccess {Object} lineups.home information of player about home team
* @apiSuccess {Object} lineups.home.pitcher information of pitcher about home team
* @apiSuccess {String} lineups.home.pitcher.jersey_number numebr of pitcher
* @apiSuccess {String} lineups.home.pitcher.lose lose of pitcher
* @apiSuccess {String} lineups.home.pitcher.last_name last name of pitcher
* @apiSuccess {String} lineups.home.pitcher.first_name first name of pitcher
* @apiSuccess {String} lineups.home.pitcher.k k of pitcher
* @apiSuccess {String} lineups.home.pitcher.era era of pitcher
* @apiSuccess {String} lineups.home.pitcher.win win of pitcher
* @apiSuccess {String} lineups.home.pitcher.id id of pitcher
* @apiSuccess {Object} lineups.away information of pitcher about away team
* @apiSuccess {String} lineups.away.pitcher.jersey_number numebr of pitcher
* @apiSuccess {String} lineups.away.pitcher.lose lose of pitcher
* @apiSuccess {String} lineups.away.pitcher.last_name last name of pitcher
* @apiSuccess {String} lineups.away.pitcher.first_name first name of pitcher
* @apiSuccess {String} lineups.away.pitcher.k k of pitcher
* @apiSuccess {String} lineups.away.pitcher.era era of pitcher
* @apiSuccess {String} lineups.away.pitcher.win win of pitcher
* @apiSuccess {String} lineups.away.pitcher.id id of pitcher
* @apiSuccess {Object} spread information of spread
* @apiSuccess {Object} spread.spread_id id of spread
* @apiSuccess {Number} spread.spread_id.add_time add time of spread
* @apiSuccess {Number} spread.spread_id.home_odd home odd of spread
* @apiSuccess {Number} spread.spread_id.away_odd away odd of spread
* @apiSuccess {Number} spread.spread_id.handicap handicap of spread
* @apiSuccess {Object} history history of fight
* @apiSuccess {String} sport name of sport
* @apiSuccess {String} league name of league
* @apiSuccess {Object} scheduled scheduled of event
* @apiSuccess {Number} scheduled._seconds timestamp of event
* @apiSuccess {Object} stat.home hit information of home team
* @apiSuccess {Number} stat.home.obp obp of home team
* @apiSuccess {Number} stat.home.avg avg of home team
* @apiSuccess {Number} stat.home.r r of home team
* @apiSuccess {Number} stat.home.hr hr of home team
* @apiSuccess {Number} stat.home.slg slg of home team
* @apiSuccess {Number} stat.home.h h of home team
* @apiSuccess {Object} stat.away hit information of away team
* @apiSuccess {Number} stat.away.obp obp of away team
* @apiSuccess {Number} stat.away.avg avg of away team
* @apiSuccess {Number} stat.away.r r of away team
* @apiSuccess {Number} stat.away.hr hr of away team
* @apiSuccess {Number} stat.away.slg slg of away team
* @apiSuccess {Number} stat.away.h h of away team


 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
[
  {
    "scheduled": {
      "_seconds": 1585039500,
      "_nanoseconds": 0
    },
    "stat": {
      "away": {
        "h": 2,
        "obp": 8,
        "avg": 0.342,
        "r": 1,
        "hr": 7,
        "slg": 2
      },
      "home": {
        "hr": 2,
        "slg": 5,
        "h": 3,
        "obp": 3,
        "avg": 0.114,
        "r": 1
      }
    },
    "radar_id": "40320",
    "away": {
      "lose_home": 10,
      "lose": 30,
      "avg_getscore": 3,
      "name_ch": "多倫多藍鳥",
      "win": 8,
      "win_home": 7,
      "win_away": 1,
      "avg_lossscore": 2,
      "precent_OU": 40,
      "precent_spread": 60,
      "lose_away": 20,
      "image_id": 3642
    },
    "bets_id": "20200320",
    "flag": {
      "status": 1
    },
    "totals": {
      "30000008": {
        "add_time": 1584515049000,
        "under_odd": 1.911,
        "handicap": 220,
        "over_odd": 1.911
      }
    },
    "home": {
      "image_id": 3646,
      "lose_home": 10,
      "lose": 25,
      "avg_getscore": 5,
      "name_ch": "波士頓紅襪",
      "win": 12,
      "win_home": 7,
      "win_away": 5,
      "avg_lossscore": 7,
      "precent_OU": 50,
      "precent_spread": 66,
      "lose_away": 15
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
          "id": "19940708",
          "jersey_number": "83",
          "lose": 8,
          "last_name": "John",
          "first_name": "Smith",
          "k": 19,
          "era": 0.168,
          "win": 22
        }
      }
    },
    "spread": {
      "30000007": {
        "add_time": 1584515049000,
        "home_odd": 1.91,
        "away_odd": 1.91,
        "handicap": 10
      }
    },
    "history": {
      "event2": {
        "home": {
          "total_runs": 1
        },
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
        }
      },
      "event1": {
        "scheduled": {
          "_seconds": 1585094400,
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
      },
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
        },
        "home": {
          "total_runs": 2
        },
        "scheduled": {
          "_seconds": 1584486000,
          "_nanoseconds": 0
        },
        "away": {
          "total_runs": 1
        }
      },
      "event0": {
        "scheduled": {
          "_seconds": 1585011600,
          "_nanoseconds": 0
        },
        "away": {
          "total_runs": 9
        },
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
        }
      }
    },
    "sport": "baseball",
    "league": "MLB"
  }
]
 
 */
