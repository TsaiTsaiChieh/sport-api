const mpgNotifyModel = require('../../model/cashflow_neweb/mpgNotifyModel');

async function mpgNotifyController(req, res) {
  try {
    res.json(await mpgNotifyModel(req.body));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = mpgNotifyController;
