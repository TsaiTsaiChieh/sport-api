const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreDeleteCollectModel');

async function deleteCollect(req, res) {
  const schema = {
    required: ['sport', 'league', 'UID', 'eventID'],
    properties: {
      sport: {
        type: 'string'
      },
      league: {
        type: 'string'
      },
      UID: {
        type: 'string'
      },
      eventID: {
        type: 'string'
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }

  req.body.token = req.token;
  try {
    res.json(await model(req.body));
  } catch (err) {
    res.status(err.code).json(err);
  }
}

module.exports = deleteCollect;
/**
 * @api {POST} /livescore/livescore/deleteCollect Post the information of event
 * @apiVersion 1.0.0
 * @apiDescription [Test version] Delete the collect event.
 * @apiName livescore delete collect
 * @apiGroup Livescore
 *
 * @apiParam {String} sport sport name, the value are: ```baseball```
 * @apiParam {String} league league name, the value are: ```MLB```
 * @apiParam {String} UID ID of user, the value are: ```DLRnd5igRmakC0VrLxz5Ph443Qj1```
 * @apiParam {String} eventID the event want to delete, the value are: ```20200321```
 * 
 * @apiParamExample {JSON} Request-Query
 {
   'sport' : 'baseball'
   'league' : 'MLB'
   'UID' : 'DLRnd5igRmakC0VrLxz5Ph443Qj1'
   'eventID' : '20200321'
 }

 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
[
  "DLRnd5igRmakC0VrLxz5Ph443Qj1 / baseball / MLB / 20200321 has deleted"
]
 
 */
