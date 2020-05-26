const modules = require('../../util/modules');
const model = require('../../model/livescore/livescorePostCollectModel');

async function postCollect(req, res) {
  const schema = {
    required: ['eventID'],
    properties: {
      eventID: {
        type: 'string'
      }
    }
  };
  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  }
  req.body.token = req.token;
  try {
    res.json(await model(req.body));
  } catch (err) {
    console.error('Error in controller/livescore/postCollect by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      ); // 再觀察
  }
}

module.exports = postCollect;
/**
 * @api {POST} /livescore/livescore/postCollect Post the information of event
 * @apiVersion 1.0.0
 * @apiDescription [Test version] Create the collect event.
 * @apiName livescore delete collect
 * @apiGroup Livescore
 *
 * @apiParam {String} sport sport name, the value are: ```basketball```
 * @apiParam {String} league league name, the value are: ```NBA```
 * @apiParam {String} UID ID of user, the value are: ```DLRnd5igRmakC0VrLxz5Ph443Qj1```
 * @apiParam {String} eventID the event want to delete, the value are: ```2114519```
 * @apiParam {String} time, the value are: ```1593561600000```

 * @apiParamExample {JSON} Request-Query
 {
   'league' : 'NBA'
   'UID' : 'DLRnd5igRmakC0VrLxz5Ph443Qj1'
   'eventID' : '2114519'
   'time' : '1593561600000'
 }

 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
[
  "DLRnd5igRmakC0VrLxz5Ph443Qj1 / baseball / MLB / 20200320 has collected"
]

 */
