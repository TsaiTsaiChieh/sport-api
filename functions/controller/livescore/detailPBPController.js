const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreDetailPBPModel');

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
  if (req.query.eventID) {
    out.eventID = req.query.eventID;
  } else {
    out.eventID = '20200320';
  }

  if (req.query.category) {
    out.category = req.query.category;
  } else {
    out.category = 'prematch';
  }
  console.log(out);

  try {
    res.json(await model(out));
  } catch (err) {
    res.status(err.code).json(err);
  }
}
module.exports = livescore;
