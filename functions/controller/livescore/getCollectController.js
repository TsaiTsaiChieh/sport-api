const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreGetCollectModel');

async function livescore(req, res) {
  switch (req.query.league) {
    case 'NBA': {
      req.query.sport = 'basketball';
      break;
    }
    case 'MLB': {
      req.query.sport = 'baseball';
      break;
    }
    case 'NHL': {
      req.query.sport = 'icehockey';
      break;
    }
    case 'Soccer': {
      req.query.sport = 'soccer';
      break;
    }
    case 'eSoccer': {
      req.query.sport = 'esports';
      break;
    }
    case 'KBO': {
      req.query.sport = 'baseball';
      break;
    }
    default: {
      req.query.league = 'eSoccer';
      req.query.sport = 'esports';
    }
  }

  const schema = {
    required: ['league', 'sport', 'UID', 'time'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA', 'MLB', 'NHL', 'Soccer', 'eSoccer', 'KBO']
      },
      sport: {
        type: 'string',
        enum: ['basketball', 'baseball', 'icehockey', 'soccer', 'esports']
      },
      UID: {
        type: 'string'
      },
      time: {
        type: 'string'
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
 * @api {GET} /livescore/livescore/getCollect Get the information of event about user
 * @apiVersion 1.0.0
 * @apiDescription [Test version] List the collect event.
 * @apiName livescore list collect
 * @apiGroup Livescore
 *
 * @apiParam {String} sport sport name, the value are: ```basketball```
 * @apiParam {String} league league name, the value are: ```NBA```
 * @apiParam {String} UID ID of user, the value are: ```DLRnd5igRmakC0VrLxz5Ph443Qj1```
 * @apiParam {String} time, the time are: ```1593561600000```
 * @apiParamExample {JSON} Request-Query
 {
   'league' : 'NBA'
   'UID' : 'DLRnd5igRmakC0VrLxz5Ph443Qj1'
   'time' : '1593561600000'
 }
* @apiSuccess {Object} event_id id of collect event
* @apiSuccess {String} event_id.sport name of sport
* @apiSuccess {String} event_id.league name of league
* @apiSuccess {String} event_id.event_id id of event
* @apiSuccess {Object} profile profile of user
* @apiSuccess {String} profile.uid id of user

 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
[
  {
    "20200320": {
      "league": "MLB",
      "sport": "baseball",
      "eventID": "20200320"
    },
    "20200321": {
      "league": "MLB",
      "sport": "baseball",
      "eventID": "20200321"
    },
    "profile": {
      "uid": "DLRnd5igRmakC0VrLxz5Ph443Qj1"
    }
  }
]

 */
