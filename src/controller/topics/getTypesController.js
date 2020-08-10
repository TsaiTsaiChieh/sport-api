/* eslint-disable promise/always-return */
const types = require('./types');
async function getTypes(req, res) {
  const league = types.getLeague(true);
  const category = types.getCategory(true);
  res.json({ code: 200, leagues: league, categories: category });
}
module.exports = getTypes;
/**
 * @api {GET} /topics/types/ getTypes
 * @apiName getTypes
 * @apiDescription 取得聯盟及文章分對照表
 * @apiGroup Topics
 */
