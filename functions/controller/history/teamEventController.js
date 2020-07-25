const modules = require('../../util/modules');
const ajv = require('../../util/ajvUtil');
const model = require('../../model/history/teamEventModel');

async function historyTeamEvent(req, res) {
  // req.query.date2 = modules.convertTimezoneFormat(
  //   modules.moment(req.query.date2).unix(),
  //   {
  //     format: 'YYYY-MM-DD',
  //     op: 'add',
  //     value: 1,
  //     unit: 'days'
  //   }
  // );

  const schema = {
    required: ['league', 'team_id', 'date1', 'date2'],
    properties: {
      league: {
        type: 'string',
        enum: modules.acceptLeague
      },
      team_id: {
        type: 'string'
      },
      date1: {
        type: 'string',
        format: 'date'
      },
      date2: {
        type: 'string',
        format: 'date'
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
    console.error('Error in controller/history/historyTeamEvent by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      ); // 再觀察
  }
}

module.exports = historyTeamEvent;
