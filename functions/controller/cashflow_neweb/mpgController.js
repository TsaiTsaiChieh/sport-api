const mpgModel = require('../../model/cashflow_neweb/mpgModel');

async function mpgController(req, res) {
  try {
    res.send(await mpgModel(req.body));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = mpgController;
