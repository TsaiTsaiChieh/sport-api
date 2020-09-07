const db = require('../../util/dbUtil');
const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
async function systemModel(req) {
  return new Promise(async function(resolve, reject) {
    const t = await db.sequelize.transaction();
    try {
      const body = req.body;
      const title = body.title; // 紀錄標題
      const scheduled = modules.moment().unix();
      const pack = {};
      body.ingot === 0 ? pack.ingot = 0 : pack.ingot = body.ingot; // 搞錠
      body.coin === 0 ? pack.coin = 0 : pack.coin = body.coin; // 搞幣
      body.dividend === 0 ? pack.dividend = 0 : pack.dividend = body.dividend; // 紅利

      pack.ingot_real = pack.ingot; // 真實搞錠
      pack.coin_real = pack.coin; // 真實搞幣
      pack.dividend_real = pack.dividend; // 真實紅利

      const data = {
        title: title,
        ingot: pack.ingot,
        ingot_real: pack.ingot_real,
        coin: pack.coin,
        coin_real: pack.coin_real,
        dividend: pack.dividend,
        dividend_real: pack.dividend_real,
        scheduled: scheduled
      };
      const system = db.CashflowLogs.create(data);
      await t.commit();
      resolve(system);
    } catch (err) {
      console.log('Error in cashflow/system by henry:  %o', err);
      await t.rollback();
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = systemModel;
