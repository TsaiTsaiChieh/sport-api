const modules = require('../../util/modules');
const model = require('../../model/sport/getEventsModel');

async function getEvents(req, res) {
  const schema = {
    type: 'object',
    // required: ['sport_id', 'date', 'page'],
    properties: {
      sport_id: {
        type: 'integer',
        // baseball, baseketball, ice_hockey, soccer
        enum: [16, 18, 17, 1],
        default: 18
      },
      date: {
        type: 'string',
        format: 'date',
        default: new Date().toISOString().slice(0, 10)
      },
      page: {
        type: 'integer',
        // minimum: 1,
        default: 1
      },
      league_id: {
        type: 'integer',
        // enum: ['2274'],
        default: 2274
      }
    }
  };
  if (req.query.sport_id)
    req.query.sport_id = Number.parseInt(req.query.sport_id);
  if (req.query.page) req.query.page = Number.parseInt(req.query.page);
  const validate = modules.ajv.validate(schema, req.query);
  console.log(
    req.query.sport_id,
    req.query.date,
    req.query.league_id,
    req.query.page
  );
  if (!validate) {
    return res.status(400).json(modules.ajv.errors);
  }
  req.query.date = req.query.date.replace(/-/g, '');

  try {
    res.json(await model(req.query));
  } catch (error) {
    res.status(500).json(error);
  }
}
module.exports = getEvents;
