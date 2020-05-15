/* eslint-disable no-unused-vars */
const { leagueCodebook, leagueDecoder } = require('../../util/modules');
const {
  convertTimezone, getTitlesPeriod, moment, checkUserRight,
  predictionsWinList
} = require('../../util/modules');

const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const to = require('await-to-js').default;
const d = require('debug')('user:settleWinListModel');


async function settleGodRank(args) {
  // 兩週審核一次 , 週一更新  周日早上 00:00 計算

  // 鑽大神 5位
  //1. 第一週最少 10 注, 兩週總數至少 30 注
  //2. 贏為正數, 輸為負數, 該聯盟注數正負相加之總和, 至少 >= 5
  //3. 如有相同數值者會先以 兩週注數量 為排名判斷
  //4. 再有相同者, 以該聯盟 下注總注數 為排名判斷

  // 金 銀 銅 各10位
  //1. 第一週最少 10 注, 兩週總數至少 30 注
  //2. 下注機率至少超過 60% 的勝率
  //3. 如有相同機率者會先以 兩週注數量 為排名判斷
  //4. 再有相同者, 以該聯盟 下注總注數 為排名判斷
  
  const period = modules.getTitlesPeriod(new Date()).period;
  const result = await db.sequelize.query(
    `
      SELECT * FROM user__win__lists__histories
    `,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  
}


module.exports = settleGodRank;
