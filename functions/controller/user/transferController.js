// const modules = require('../../util/modules');
const transferModel = require('../../model/user/transferModel');

async function transfer(req, res) {
  try {
    req.args = req.body;
    res.json(await transferModel(req.args, req.token.uid));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}
module.exports = transfer;
