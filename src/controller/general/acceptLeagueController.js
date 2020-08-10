const model = require('../../model/general/acceptLeagueModel');

async function acceptLeague(req, res) {
  try {
    res.json(await model(req.query));
  } catch (err) {
    console.error('Error in controller/livescore/livescoreClosed by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}
module.exports = acceptLeague;
