const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreGetCollectModel');

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
    required: ['league', 'sport', 'UID'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA', 'MLB', 'NHL', 'soccer']
      },
      sport: {
        type: 'string',
        enum: ['basketball', 'baseball', 'icehockey', 'soccer']
      },
      UID: {
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
 * @apiParam {String} sport sport name, the value are: ```baseball```
 * @apiParam {String} league league name, the value are: ```MLB```
 * @apiParam {String} UID ID of user, the value are: ```DLRnd5igRmakC0VrLxz5Ph443Qj1```
 * 
 * @apiParamExample {JSON} Request-Query
 {
   'sport' : 'baseball'
   'league' : 'MLB'
   'UID' : 'DLRnd5igRmakC0VrLxz5Ph443Qj1'
   'eventID' : '20200320'
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
