const { acceptLeague } = require('../../config/acceptValues');
const ajv = require('../../util/ajvUtil');
const httpStatus = require('http-status');
const model = require('../../model/livescore/livescoreGetCollectModel');

async function livescore(req, res) {
  const schema = {
    required: ['league', 'date'],
    properties: {
      league: {
        type: 'string',
        enum: acceptLeague
      },
      date: {
        type: 'string',
        format: 'date'
      }
    }
  };
  const valid = ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(httpStatus.BAD_REQUEST).json(ajv.errors);
  }
  req.query.token = req.token;

  try {
    res.json(await model(req.query));
  } catch (err) {
    console.error('Error in controller/livescore/getCollect by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      ); // 再觀察
  }
}
module.exports = livescore;
/**
 * @api {GET} /livescore/getCollect Get the event collected
 * @apiVersion 1.0.0
 * @apiDescription [Test version] List the collect event.
 * @apiName livescore list collect
 * @apiGroup Livescore
 * @apiParam {String} league league name, the value are: ```eSoccer```
 * @apiParam {String} date, the date are: ```2020-07-06```
 * @apiParamExample {JSON} Request-Query
 {
   'league' : 'eSoccer'
   'date' : '2020-07-06'
 }
* @apiSuccess {String} id id of collect event

 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
[
    "20200320"
    "20200321",
]

 */
