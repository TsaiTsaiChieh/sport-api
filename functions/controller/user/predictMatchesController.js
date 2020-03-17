const modules = require('../../util/modules');
const model = require('../../model/user/predictMatchesModel');

// eslint-disable-next-line consistent-return
async function predictMatches(req, res) {
  const now = Date.now();
  const schema = {
    type: 'object',
    required: ['league', 'matches'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA']
      },
      matches: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id'],
          anyOf: [{ required: ['spread'] }, { required: ['totals'] }],
          properties: {
            id: {
              type: 'string'
            },
            spread: {
              type: 'array',
              items: [
                { type: 'string' },
                { type: 'string', enum: ['home', 'away'] },
                { type: 'integer', minimum: 1, maximum: 3 }
              ]
            },
            totals: {
              type: 'array',
              item: [
                { type: 'string' },
                { type: 'string', enum: ['over', 'under'] },
                { type: 'integer', minimum: 1, maximum: 3 }
              ]
            }
          }
        }
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    return res.status(400).json(modules.ajv.errors);
  }
  req.body.token = req.token;
  req.body.now = now;
  try {
    res.json(await model(req.body));
  } catch (err) {
    res.status(err.code).json(err);
  }
}

module.exports = predictMatches;
