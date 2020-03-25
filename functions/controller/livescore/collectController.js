const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreCollectModel');

async function livescore(req, res) {
  let out = {};
  if (req.query.UID) {
    out.userID = req.query.UID;
  } else {
    out = {};
    out.error = 1301;
  }
  if (req.query.sport) {
    out.sport = req.query.sport;
  } else {
    out = {};
    out.error = 1301;
  }
  if (req.query.league) {
    out.league = req.query.league;
  } else {
    out = {};
    out.error = 1301;
  }

  try {
    res.json(await model(out));
  } catch (err) {
    res.status(err.code).json(err);
  }
}
module.exports = livescore;
