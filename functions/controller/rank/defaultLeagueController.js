const modules = require('../../util/modules');
const defaultLeagueModel = require('../../model/rank/defaultLeagueModel');

async function searchUser (req, res) {
  try {
    res.json(await defaultLeagueModel());
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}
module.exports = searchUser;
