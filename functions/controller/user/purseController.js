// const modules = require('../../util/modules');
const purseModel = require('../../model/user/purseModel');

async function purse(req, res) {
  try {
    res.json(await purseModel(req.body.method, req.token.uid));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}
module.exports = purse;
