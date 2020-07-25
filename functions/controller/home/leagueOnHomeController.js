const modules = require('../../util/modules');
const ajv = require('../../util/ajvUtil');
const model = require('../../model/home/leagueOnHomeModel');
async function leagueOnHome(req, res) {
  const schema = {
    required: ['league'],
    properties: {
      league: {
        type: 'string',
        enum: modules.acceptLeague
      }
    }
  };

  const valid = ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(ajv.errors);
  }
  try {
    res.json(await model(req.query));
  } catch (err) {
    console.error('Error in controller/home/leagueOnHome by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      ); // 再觀察
  }
}

module.exports = leagueOnHome;
