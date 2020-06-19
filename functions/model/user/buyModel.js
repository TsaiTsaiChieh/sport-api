/* eslint-disable no-unused-vars */
const { moment, convertTimezone } = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const { getGodSellPredictionDatesWinBetsInfo, getGodSellPredictionWinBetsInfo } = require('../../util/databaseEngine');

function buyModel(args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const buyList = [];
      const begin = args.begin;
      const end = args.end;
      const buy = await getGodSellPredictionDatesWinBetsInfo(uid, begin, end);
      // const rangeDate = moment.range(begin, end);

      // const arrRangeDate = [];
      // Array.from(rangeDate.by('day')).forEach(function(data) {
      //   arrRangeDate.push(convertTimezone(data.format('YYYYMMDD')));
      // });
      // // console.log('arrRangeDate: ', arrRangeDate);

      // // 用 bind 會有錯誤
      // const buy = await db.sequelize.query(
      //   `
      //     SELECT *
      //       FROM user__buys
      //      where matches_date in (:arrRangeDate)
      //        -- and uid = :uid
      //   `,
      //   {
      //     replacements: { uid: uid, arrRangeDate: arrRangeDate },
      //     type: db.sequelize.QueryTypes.SELECT
      //   }
      // );

      for (const [index, ele] of Object.entries(buy)) {
        console.log('ele: ', ele);
        // const t = await getGodSellPredictionWinBetsInfo(ele.god_uid, ele.league_id, ele.matches_date);
        // console.log('t: ', t);
      };

      resolve(buyList);
    } catch (err) {
      console.log('Error in  user/buy by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = buyModel;
