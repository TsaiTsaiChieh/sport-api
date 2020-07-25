const modules = require('../../util/modules');
const ajv = require('../../util/ajvUtil');
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
  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(ajv.errors);
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
 * @api {POST} /livescore/postCollect Post the information of event
 * @apiVersion 1.0.0
 * @apiDescription [Test version] Create the collect event.
 * @apiName livescore post collect
 * @apiGroup Livescore
 *
 * @apiParam {String} eventID the event want to delete, the value are: ```2114519```

 * @apiParamExample {JSON} Request-Query
 {
   'eventID' : '2114519'
 }

 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
[
  "DLRnd5igRmakC0VrLxz5Ph443Qj1 / esports / eSoccer / 2114519 has collected"
]

 */
