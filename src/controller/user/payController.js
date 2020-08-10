const payModel = require('../../model/user/payModel');
async function pay(req, res) {
  try {
    return res.status(200).json(await payModel(req.method, req.body, req.token.uid));
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
}

module.exports = pay;
