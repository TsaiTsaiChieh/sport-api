/* eslint-disable promise/always-return */
const types = require('./types');
async function getTypes(req, res) {
  const league = types.getLeague(true);
  const category = types.getCategory(true);
  res.json({ code: 200, leagues: league, categories: category });
}
module.exports = getTypes;
