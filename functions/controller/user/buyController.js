// const modules = require('../../util/modules');
const buyModel = require('../../model/user/buyModel');

async function buy(req, res) {
  try {
    req.args = req.body;
    res.json(await buyModel(req.args, req.params.uid));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}
module.exports = buy;
