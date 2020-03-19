const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreInprogressModel');

async function livescore(req, res) {
  let out;
  if (req.query.league) {
    out = {
      league: req.query.league
    };
  } else {
    out = {
      league: 'MLB'
    };
  }

  try {
    res.json(await model(out));
  } catch (err) {
    res.status(err.code).json(err);
  }
}
module.exports = livescore;
