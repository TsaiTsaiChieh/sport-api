// const modules = require('../../util/modules');
const bankModel = require('../../model/user/bankModel');

async function purse(req, res) {
  try {
    res.json(await bankModel(req.body, req.method, req.token.uid));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}
module.exports = purse;
