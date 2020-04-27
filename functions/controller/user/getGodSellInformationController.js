const modules = require('../../util/modules');
const model = require('../../model/user/getGodSellInformationModel');

async function godSellInformation(req, res) {
  const schema = {
    type: 'object',
    required: ['league', 'date'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA', 'eSoccer']
      },
      date: {
        type: 'string',
        format: 'date'
      }
    }
  };
  const args = {
    token: req.token,
    league: req.query.league,
    date: req.query.date
  };
  const valid = modules.ajv.validate(schema, args);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  }

  try {
    res.json(await model(args));
  } catch (err) {
    console.error(
      'Error in controller/user/getGodSellInformation function by TsaiChieh',
      err
    );
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}

module.exports = godSellInformation;
