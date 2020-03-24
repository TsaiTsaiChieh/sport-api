const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreScheduledModel');

async function livescore(req, res) {
  let out = {};
  if (req.query.sport) {
    out.sport = req.query.sport;
  } else {
    out.sport = 'baseball';
  }
  if (req.query.league) {
    out.league = req.query.league;
  } else {
    out.league = 'MLB';
  }
  if (req.query.time) {
    out.time = req.query.time;
  } else {
    out.time = 1584982800000;
    // out.time = Date.now();
  }

  try {
    res.json(await model(out));
  } catch (err) {
    res.status(err.code).json(err);
  }
}
module.exports = livescore;
