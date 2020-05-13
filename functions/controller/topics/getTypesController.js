/* eslint-disable promise/always-return */
const types = require('./types');
async function getTypes(req, res) {
  const type = types.getType(true);
  const category = types.getCategory();
  res.json({ code: 200, types: type, categories: category });
}
module.exports = getTypes;
