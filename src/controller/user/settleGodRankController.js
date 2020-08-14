// const modules = require('../../util/modules');
const settleGodRankModel = require('../../model/user/settleGodRankModel');

async function settleGodRank(req, res) {
  try {
    res.status(200).json(await settleGodRankModel(req));
  } catch (e) {
    console.error(e);
    return res.status(500).send(e);
  }
}
module.exports = settleGodRank;
