// const modules = require('../../util/modules');
const transferModel = require('../../model/user/transferModel');

async function transfer(req, res) {
  try {
    res.json(await transferModel(req.method, req.body, req.token.uid));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}
module.exports = transfer;
