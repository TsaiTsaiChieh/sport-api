// const modules = require('../../util/modules');
const buyModel = require('../../model/user/buyModel');

async function buy(req, res) {
  try {
    res.json(await buyModel(req.params.uid));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}
module.exports = buy;
