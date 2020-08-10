// const modules = require('../../util/modules');
const settleGodRankModel = require('../../model/user/settleGodRankModel');

function settleGodRank(req, res) {
  const returnJson = {};
  try {
    res.json(settleGodRankModel(req));
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
  res.status(200).json(returnJson);
}
module.exports = settleGodRank;
