const ccardNotifyModel = require('../../model/cashflow_api/ccardNotifyModel');

async function ccardNotifyController(req, res) {
  try {
    res.send(await ccardNotifyModel(req));
  } catch (err) {
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = ccardNotifyController;
