const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreDetailModel');

async function livescore(req, res) {
  let out;
  if (req.query.eventID) {
    out = {
      league: req.query.league,
      eventID: req.query.eventID
    };
  } else {
    out = {
      league: 'undefined',
      eventID: 'undefined'
    };
  }

  try {
    res.json(await model(out));
  } catch (err) {
    res.status(err.code).json(err);
  }
}
module.exports = livescore;
