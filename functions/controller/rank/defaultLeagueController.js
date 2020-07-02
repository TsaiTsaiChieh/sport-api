const defaultLeagueModel = require('../../model/rank/defaultLeagueModel');

async function searchUser(req, res) {
  try {
    res.json(await defaultLeagueModel());
  } catch (err) {
    console.error('[defaultLeagueController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = searchUser;
