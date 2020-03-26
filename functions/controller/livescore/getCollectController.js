const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreGetCollectModel');

async function livescore(req, res) {
  let out = {};
  if (req.query.UID) {
    out.userID = req.query.UID;
  } else {
    out = {};
    out.error = 1301;
  }
  if (req.query.sport) {
    out.sport = req.query.sport;
  } else {
    out = {};
    out.error = 1301;
  }
  if (req.query.league) {
    out.league = req.query.league;
  } else {
    out = {};
    out.error = 1301;
  }

  try {
    res.json(await model(out));
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
