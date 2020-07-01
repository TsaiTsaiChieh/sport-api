const mpgNotifyModel = require('../../model/cashflow_neweb/mpgNotifyModel');

async function mpgNotifyController(req, res) {
  try {
    res.send(await mpgNotifyModel(req));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = mpgNotifyController;
