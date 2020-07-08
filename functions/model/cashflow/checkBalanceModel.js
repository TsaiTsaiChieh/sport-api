const db = require('../../util/dbUtil');
async function checkBalanceModel(data) {
  return new Promise(async function(resolve, reject) {
    const uid = data.uid;
    const dividend_cost = data.dividend_cost || 0;
    const coin_cost = data.coin_cost || 0;
    const ingot_cost = data.ingot_cost || 0;
    /* 使用者錢包 */
    const purse = await db.sequelize.query(
        `SELECT ingot, coin, dividend
            FROM users
            WHERE uid = :uid`,
        {
          plain: true,
          replacements: { uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        });
    /* 判斷扣除後是否搞錠大於0 */
    if (purse.ingot - ingot_cost < 0) {
      reject({ error: '使用者搞錠不足' });
      return false;
    }
    /* 判斷扣除後是否搞幣大於0 */
    if (purse.coin - coin_cost < 0) {
      reject({ error: '使用者搞幣不足' });
      return false;
    }
    /* 判斷扣除後是否紅利大於0 */
    if (purse.dividend - dividend_cost < 0) {
      reject({ error: '使用者紅利不足' });
      return false;
    }

    resolve(purse);
  });
}

module.exports = checkBalanceModel;
