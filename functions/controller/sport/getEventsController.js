const modules = require('../../util/modules');
const model = require('../../model/sport/getEventsModel');

async function getEvents(req, res) {
  const schema = {
    type: 'object',
    properties: {
      sport_id: {
        type: 'integer',
        // baseball, baseketball, ice_hockey, soccer
        enum: [16, 18, 17, 1],
        default: 16
      },
      day: {
        type: 'string',
        format: 'date',
        default: '2016-12-01'
      },
      page: {
        type: 'integer',
        minimum: 0,
        default: 0
      }
    }
  };
  req.query.sport_id = Number.parseInt(req.query.sport_id);
  req.query.page = Number.parseInt(req.query.page);
  const validate = modules.ajv.validate(schema, req.query);
  if (!validate) {
    return res.status(400).json(modules.ajv.errors);
  }
  try {
    res.json(await model(req.query));
  } catch (error) {
    res.status(500).json(error);
  }
}
module.exports = getEvents;
