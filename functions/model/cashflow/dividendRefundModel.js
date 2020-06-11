const db = require('../../util/dbUtil');
const modules = require('../../util/modules');
const { getGodSellPredictionWinBetsInfo } = require('../../util/databaseEngine');
function dividendRefundModel(args) {
  return new Promise(async function(resolve, reject) {
    /* 前一天起始值、結束值、現在時間 */
    const nowInfo = modules.dateUnixInfo(Date.now());
    const yesterdayYYYYMMDDUnix = nowInfo.yesterdayBeginUnix;
    const scheduled = modules.moment().unix();
    const buyLists = await db.CashflowBuy.findAll({
      attributes: [
        'uid',
        'god_uid',
        'league_id',
        'status',
        'scheduled'
      ],
      raw: true
    });
    /* 計算是否勝注<=0 */
    const buy = [];
    for (const [index, data] of Object.entries(buyLists)) {
      const t = await getGodSellPredictionWinBetsInfo(data.god_uid, data.league_id, yesterdayYYYYMMDDUnix);
      t.forEach(function(ele) {
        /* 因應勝注是否<=0去發放紅利 */
        if (ele.win_bet <= 0) {
          /* (購牌金額-90)*0.05 */
          ele.dividend_real = (ele.sub_price) * 0.05 * 100 / 100;
        } else {
          /* 購牌金額*0.05 */
          ele.dividend_real = ele.price * 100 * 0.05 / 100;
        }

        ele.dividend = Math.round(ele.dividend_real);
        buy.push(ele);

        /* 寫入紅利回饋 */
        db.sequelize.models.cashflow_dividend.create({
          uid: ele.uid,
          expire_points: ele.dividend,
          dividend_real: ele.dividend_real,
          status: 1,
          dividend_status: 1,
          scheduled: scheduled
        });
      });
    }
    console.log('infos: %o', buy);
  });
}

module.exports = dividendRefundModel;
