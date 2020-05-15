const { ajv } = require('../../util/modules');
const settleGodRankModel = require('../../model/user/settleGodRankModel');

async function settleGodRank(req, res) {
  try {
    req.body.token = req.token;
    res.json(await settleGodRankModel(req));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = settleGodRank;
