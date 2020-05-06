const payModel = require('../../model/user/payModel');
async function pay(req, res) {
  const returnJson = {};
  try {
    res.json(await payModel(req.method, req.body, req.token.uid));
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
  res.status(200).json(returnJson);
}

module.exports = pay;
